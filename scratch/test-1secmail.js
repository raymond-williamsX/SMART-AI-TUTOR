async function main() {
  const urls = [
    "https://www.1secmail.com/api/v1/?action=genEmailAddresses&count=1",
    "https://1secmail.com/api/v1/?action=genEmailAddresses&count=1"
  ];
  for (const url of urls) {
    console.log(`Fetching ${url}...`);
    try {
      const res = await fetch(url);
      console.log(`Status: ${res.status}`);
      const body = await res.text();
      console.log(`Body: ${body}`);
    } catch (err) {
      console.error(`Failed: ${err.message}`);
    }
  }
}
main();
