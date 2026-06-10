async function main() {
  const url = "http://localhost:3000/api/upload";
  console.log(`Fetching ${url} without auth cookies...`);
  try {
    const res = await fetch(url, { method: "POST" });
    console.log(`Status: ${res.status} ${res.statusText}`);
    console.log("Headers:");
    for (const [key, val] of res.headers.entries()) {
      console.log(`  ${key}: ${val}`);
    }
    const body = await res.text();
    console.log(`Body Length: ${body.length}`);
    console.log("Body sample (first 1000 chars):");
    console.log(body.slice(0, 1000));
  } catch (err) {
    console.error("Fetch failed:", err);
  }
}
main();
