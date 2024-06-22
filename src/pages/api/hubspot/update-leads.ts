import { NextApiRequest, NextApiResponse } from "next";

const HUBSPOT_API_KEY = process.env.HUBSPOT_API_KEY;

interface Contact {
  id: string;
  properties: {
    owner: string;
    hs_lead_status: string;
  };
}

interface REQ {
  company: string;
  idResults: string[];
}

async function batchUpdateContacts(
  contactIds: string[],
  propertiesToUpdate: Partial<Contact>
) {
  const updateRequests = contactIds.map((id) => ({
    id,
    properties: propertiesToUpdate.properties,
  }));

  const requestBody = {
    inputs: updateRequests,
  };

  try {
    const response = await fetch(
      "https://api.hubapi.com/crm/v3/objects/contacts/batch/update",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${HUBSPOT_API_KEY}`,
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const resp = await response.text();
      throw new Error(
        `Batch update failed with status ${response.status}: ${resp}`
      );
    }

    const responseBody = await response.json();

    return responseBody; // Directly return the response body
  } catch (error) {
    console.error("Error during batch update:", error);
    throw error;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method !== "POST") {
      res.setHeader("Allow", ["POST"]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    let { company, idResults }: REQ = req.body;

    if (!idResults) {
      return res.status(500).json({ error: "Failed to receive a zip" });
    }

    console.log("Contact IDs: ", idResults);
    const propertiesToUpdate = {
      properties: {
        owner: `${company}`,
        hs_lead_status: "CONNECTED",
      },
    };

    const data = await batchUpdateContacts(idResults, propertiesToUpdate);

    return res
      .status(200)
      .json({ message: "The update worked", responseBody: data });
  } catch (error) {
    console.error("Error during operation:", error);

    return res.status(500).json({ error: "Failed to update contacts' owner" });
  }
}
