import { NextApiRequest, NextApiResponse } from "next";

const HUBSPOT_API_KEY = process.env.HUBSPOT_API_KEY;

interface Contact {
  id: string;
  properties: {
    firstname: string;
    lastname: string;
    email: string;
    phone: string;
  };
}
interface HSLead {
  id: string;
  properties: {
    hs_lead_status: string;
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    let { zipCode } = req.body;

    // Post a filter returning the zip when zip = zipCode.
    const postData = {
      filterGroups: [
        {
          filters: [
            {
              propertyName: "zip",
              operator: "EQ",
              value: zipCode,
            },
          ],
        },
      ],
      properties: [
        "id",
        "hs_lead_status",
        "firstname",
        "lastname",
        "email",
        "phone",
      ],
    };

    try {
      const hubspotResponse = await fetch(
        "https://api.hubapi.com/crm/v3/objects/contacts/search",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${HUBSPOT_API_KEY}`,
          },
          body: JSON.stringify(postData),
        }
      );

      if (!hubspotResponse.ok) {
        const errorBody = await hubspotResponse.text();
        throw new Error(
          `HubSpot API request failed with status ${hubspotResponse.status}: ${errorBody}`
        );
      }

      const data = await hubspotResponse.json();

      // Filter first by OPEN leads for ZIP
      data.results = data.results.filter(
        (contact: HSLead) => contact.properties.hs_lead_status === "OPEN"
      );

      const results = data.results.map((contact: Contact) => ({
        id: contact.id,
        ...contact.properties,
      }));

      const idResults: string[] = [];

      for (let i = 0; i < data.results.length; i++) {
        idResults.push(data.results[i].id);
      }

      console.log("ID requests: ", idResults);

      console.log(`Relevant Contacts Information: ${JSON.stringify(results)}`); // This is everything for each record...

      // Get the length
      const totalCount = data.results ? data.results.length : 0;
      console.log(`Counted ${totalCount} relevant leads on the backend.`);

      if (totalCount === 0) {
        res.status(204).send({ message: "No Content" });
      } else {
        res.status(200).json({
          count: totalCount,
          ids: idResults,
          customerInfo: results,
        });
      }
    } catch (error) {
      console.error(
        "Error counting contacts based on ZIP from HubSpot:",
        error
      );
      res.status(500).json({
        message: `Failed to count contacts based on ZIP from HubSpot, ${error}`,
      });
    }
  } else {
    res.status(405).send({ message: "Method Not Allowed" });
  }
}
