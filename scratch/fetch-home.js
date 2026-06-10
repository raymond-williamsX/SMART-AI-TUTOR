async function main() {
  const url = "http://localhost:3000/?auth=login&redirectTo=%2Fchat";
  console.log(`Fetching ${url}...`);
  try {
    const res = await fetch(url);
    console.log(`Status: ${res.status} ${res.statusText}`);
    console.log("Headers:");
    for (const [key, val] of res.headers.entries()) {
      console.log(`  ${key}: ${val}`);
    }
    const html = await res.text();
    console.log(`Body Length: ${html.length}`);
    console.log("Body sample (first 500 chars):");
    console.log(html.slice(0, 500));
  } catch (err) {
    console.error("Fetch failed:", err);
  }
}
main();
