const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = "https://dcsoggbyzpmypeimsudt.supabase.co";
const SUPABASE_KEY = "sb_publishable_t00vhpLdvqdm1dUImI-eBw_H9o9alga";

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log("Fetching mail.tm domains...");
  const domainsRes = await fetch("https://api.mail.tm/domains");
  const domainsJson = await domainsRes.json();
  const domain = domainsJson["hydra:member"][0].domain;

  const randomId = Math.floor(Math.random() * 1000000);
  const email = `testuser${randomId}@${domain}`;
  const password = "Password123!";

  console.log(`Creating mail.tm account for: ${email}`);
  const accountRes = await fetch("https://api.mail.tm/accounts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address: email, password: password })
  });
  
  if (!accountRes.ok) {
    const errText = await accountRes.text();
    console.error("Failed to create mail.tm account:", errText);
    return;
  }

  console.log("Getting mail.tm token...");
  const tokenRes = await fetch("https://api.mail.tm/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address: email, password: password })
  });
  const tokenJson = await tokenRes.json();
  const mailToken = tokenJson.token;

  console.log("Initializing Supabase Client...");
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false }
  });

  console.log(`Signing up user on Supabase: ${email}`);
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password
  });

  if (signUpError) {
    console.error("Sign up failed:", signUpError);
    return;
  }
  console.log("Sign up call succeeded. Polling inbox for verification email...");

  // Poll inbox for confirmation email
  let confirmUrl = null;
  const maxPolls = 15;
  for (let poll = 1; poll <= maxPolls; poll++) {
    console.log(`Checking mailbox (Attempt ${poll}/${maxPolls})...`);
    const listRes = await fetch("https://api.mail.tm/messages", {
      headers: { "Authorization": `Bearer ${mailToken}` }
    });
    const listJson = await listRes.json();
    const messages = listJson["hydra:member"];

    if (messages && messages.length > 0) {
      console.log(`Found message. Fetching details for message ID: ${messages[0].id}...`);
      const msgId = messages[0].id;
      const msgRes = await fetch(`https://api.mail.tm/messages/${msgId}`, {
        headers: { "Authorization": `Bearer ${mailToken}` }
      });
      const msgDetails = await msgRes.json();
      
      const body = msgDetails.html || msgDetails.text || "";
      const htmlBody = Array.isArray(body) ? body.join("\n") : body;

      // Extract verification/confirmation URL
      const urlRegex = /https:\/\/dcsoggbyzpmypeimsudt\.supabase\.co\/auth\/v1\/verify\?[^\s"']+/;
      const match = htmlBody.match(urlRegex);
      if (match) {
        confirmUrl = match[0].replace(/&amp;/g, "&");
        console.log("Found confirmation URL!");
        break;
      }
    }

    await sleep(4000);
  }

  if (!confirmUrl) {
    console.error("Failed to receive confirmation email or extract link in time.");
    return;
  }

  console.log(`Confirming email by calling: ${confirmUrl}`);
  const confirmRes = await fetch(confirmUrl);
  console.log(`Confirmation response status: ${confirmRes.status}`);

  console.log("Signing in with confirmed account...");
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (signInError) {
    console.error("Sign in failed:", signInError);
    return;
  }
  console.log("Sign in succeeded!");

  const activeSession = signInData.session;
  const token = activeSession.access_token;
  const user = activeSession.user;

  // 1. Create a study session in the database
  console.log("Creating study session...");
  const { data: studySession, error: studySessionError } = await supabase
    .from("study_sessions")
    .insert({
      user_id: user.id,
      title: "Automated E2E Test Session",
      topic_category: "General Study"
    })
    .select("id")
    .single();

  if (studySessionError) {
    console.error("Failed to create study session:", studySessionError);
    return;
  }
  console.log(`Study session created: ${studySession.id}`);

  // 2. Upload file to Supabase storage bucket 'uploaded-materials'
  const bucketName = "uploaded-materials";
  const fileName = `e2e_test_doc_${Date.now()}.txt`;
  const storagePath = `${user.id}/${studySession.id}/${fileName}`;
  const fileContent = "This is a real test document for the EduAgent AI platform. Let's verify that the RAG processing pipeline can chunk, embed, and index this document in ElasticSearch, and then retrieve it successfully!";

  console.log(`Uploading file ${fileName} to bucket '${bucketName}'...`);
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from(bucketName)
    .upload(storagePath, Buffer.from(fileContent), {
      contentType: "text/plain",
      upsert: false
    });

  if (uploadError) {
    console.error("File upload to storage failed:", uploadError);
    return;
  }
  console.log("File uploaded to storage successfully.");

  // 3. Insert metadata into uploaded_materials
  console.log("Inserting metadata into uploaded_materials...");
  const { data: materialRow, error: materialError } = await supabase
    .from("uploaded_materials")
    .insert({
      user_id: user.id,
      session_id: studySession.id,
      file_name: fileName,
      file_type: "text/plain",
      storage_path: storagePath
    })
    .select("id")
    .single();

  if (materialError) {
    console.error("Failed to insert material metadata:", materialError);
    return;
  }
  console.log(`Metadata inserted successfully. Material ID: ${materialRow.id}`);

  // 4. Trigger RAG processing via the API endpoint
  const processUrl = `http://localhost:3000/api/materials/${materialRow.id}/process`;
  console.log(`Calling process URL: ${processUrl}`);

  // Format cookie name to match @supabase/ssr default: sb-<project-id>-auth-token
  const projectId = "dcsoggbyzpmypeimsudt";
  const sessionData = {
    access_token: token,
    refresh_token: activeSession.refresh_token,
    user: user,
    token_type: "bearer",
    expires_in: activeSession.expires_in,
    expires_at: activeSession.expires_at
  };
  const base64Session = Buffer.from(JSON.stringify(sessionData)).toString("base64");
  const cookieHeader = `sb-${projectId}-auth-token=${encodeURIComponent("base64-" + base64Session)}`;

  const response = await fetch(processUrl, {
    method: "POST",
    headers: {
      "Cookie": cookieHeader,
      "Content-Type": "application/json"
    }
  });

  console.log(`Response Status: ${response.status} ${response.statusText}`);
  const rawBody = await response.text();
  console.log("Raw Response Body:");
  console.log(rawBody);

  try {
    const json = JSON.parse(rawBody);
    console.log("JSON response parsed successfully:", json);
    if (json.success) {
      console.log("\n=================================");
      console.log("E2E UPLOAD AND RAG SUCCESSFUL!");
      console.log("=================================");
    }
  } catch (err) {
    console.error("Failed to parse response as JSON. It is probably HTML!");
  }
}

main().catch(console.error);
