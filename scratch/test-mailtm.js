async function main() {
  console.log("Fetching mail.tm domains...");
  try {
    const domainsRes = await fetch("https://api.mail.tm/domains");
    console.log(`Status: ${domainsRes.status}`);
    const domainsJson = await domainsRes.json();
    console.log("Domains:", domainsJson);
  } catch (err) {
    console.error("Failed:", err.message);
  }
}
main();
