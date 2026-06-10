const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = "https://dcsoggbyzpmypeimsudt.supabase.co";
const SUPABASE_KEY = "sb_publishable_t00vhpLdvqdm1dUImI-eBw_H9o9alga";

async function main() {
  console.log("Initializing Supabase Client...");
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false }
  });

  const email = `testuser${Math.floor(Math.random() * 1000000)}@gmail.com`;
  const password = "Password123!";

  console.log(`Signing up test user: ${email}`);
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password
  });

  if (signUpError) {
    console.error("Sign up failed:", signUpError);
    return;
  }

  const session = signUpData.session;
  if (!session) {
    console.log("Sign up succeeded, but confirmation is required. Trying to sign in...");
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (signInError) {
      console.error("Sign in failed:", signInError);
      return;
    }
    console.log("Sign in succeeded!");
  } else {
    console.log("Sign up succeeded and auto-signed in!");
  }

  const activeSession = session || signUpData.session;
  const token = activeSession.access_token;
  const user = activeSession.user;

  // 1. Create a mock study session in the database
  console.log("Creating study session...");
  const { data: studySession, error: studySessionError } = await supabase
    .from("study_sessions")
    .insert({
      user_id: user.id,
      title: "Test Upload Session",
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
  const fileName = `test_doc_${Date.now()}.txt`;
  const storagePath = `${user.id}/${studySession.id}/${fileName}`;
  const fileContent = "This is a test document. Let's check if the RAG processing pipeline extracts this text correctly!";

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
  const cookieValue = JSON.stringify([token, activeSession.refresh_token]);
  const cookieHeader = `sb-${projectId}-auth-token=${encodeURIComponent(cookieValue)}`;

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
  } catch (err) {
    console.error("Failed to parse response as JSON. It is probably HTML!");
  }
}

main().catch(console.error);
