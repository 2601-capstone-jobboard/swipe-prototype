import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const API_KEY = process.env.USAJOBS_API_KEY;
const USER_AGENT = process.env.USAJOBS_USER_AGENT;

if (!API_KEY || !USER_AGENT) {
  throw new Error("Missing USAJobs environment variables");
}

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Job Finder backend is running");
});

app.get("/jobs", async (req, res) => {
  try {
    const params = new URLSearchParams();

    const keyword = req.query.keyword || "Software";
    const location = req.query.location || "Cleveland, Ohio";

    params.append("Keyword", keyword);
    params.append("LocationName", location);

    if (req.query.minimumSalary) {
      params.append("RemunerationMinimumAmount", req.query.minimumSalary);
    }

    if (req.query.securityClearance) {
      params.append("SecurityClearanceRequired", req.query.securityClearance);
    }

    const url = `https://data.usajobs.gov/api/search?${params.toString()}`;

    console.log("USAJobs request URL:");
    console.log(url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Host: "data.usajobs.gov",
        "User-Agent": USER_AGENT,
        "Authorization-Key": API_KEY,
      },
    });

    if (!response.ok) {
      console.log("USAJobs error:", response.status, response.statusText);

      return res.status(response.status).json({
        error: "USAJobs request failed",
        status: response.status,
        message: response.statusText,
      });
    }

    const data = await response.json();

    const items = data.SearchResult?.SearchResultItems || [];

    const jobs = items.map((job) => {
      const details = job.MatchedObjectDescriptor;
      const pay = details.PositionRemuneration?.[0];

      return {
        id: job.MatchedObjectId,
        title: details.PositionTitle,
        company: details.OrganizationName,
        location: details.PositionLocationDisplay,
        applyUrl: details.PositionURI,
        salary: pay
          ? `$${pay.MinimumRange} - $${pay.MaximumRange}`
          : "Salary not listed",
        securityClearance:
          details.UserArea?.Details?.SecurityClearance || "Not listed",
        description:
          details.UserArea?.Details?.JobSummary ||
          `Apply for ${details.PositionTitle} at ${details.OrganizationName}.`,
        skills: ["USAJobs", "Government"],
      };
    });

    res.json(jobs);
  } catch (error) {
    console.error("Server error:", error);

    res.status(500).json({
      error: "Failed to fetch jobs",
      message: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});