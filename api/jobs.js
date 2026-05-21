const BASE_URL = "http://localhost:3000";

export async function getJobs() {
  const response = await fetch(
    `${BASE_URL}/jobs?keyword=Software&location=Cleveland, Ohio`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch jobs");
  }

  return response.json();
}