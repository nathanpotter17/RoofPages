"use client";

import { useEffect, useState } from "react";

interface ResultItem {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
}

export default function Success() {
  let email = "";
  let sessionId = "";
  const [waiting, setWaiting] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    email = localStorage.getItem("email") as string;
    const urlParams = new URLSearchParams(window.location.search);
    sessionId = urlParams.get("session_id") || "";
  }, []);

  const handleChargeLater = async () => {
    if (sessionId) {
      setWaiting(true);
      // get company name and zip codes from the company from prisma for counting results and updating hubspot.
      const companyInfo = await fetch(`/api/contractors/email/${email}`, {
        method: "GET",
      });

      const info = await companyInfo.json();
      const company = info.company;
      const companyEmail = info.email;
      const zipCodes = info.zipCodes;

      console.log(
        `Company: ${company}, Email: ${companyEmail}, Zip Codes: ${zipCodes}`
      );

      // Call the count of available leads. Returns Customer information.
      const req = await fetch("/api/hubspot/count-leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ zipCodes }),
      });
      if (!req.ok) {
        console.error("POST error", req.status);
        return;
      }

      const res = await req.json();
      const leadCount = res.count as number;
      const customerInfo = res.customerInfo;
      const idResults = res.ids;
      console.log(`Counted ${leadCount} leads on the frontend`);

      if (leadCount === 0) {
        console.error("No Available Leads.");
        return;
      }

      if (customerInfo === undefined || idResults === undefined) {
        console.error("Bad Data.");
        return;
      }

      console.log(
        `Customer Information for lead package: ${customerInfo.map(
          (contact: ResultItem) =>
            `${contact.id},${contact.email},${contact.firstname},${contact.lastname},${contact.phone}`
        )}`
      );

      // const csvContent = ["ID,Email,First Name,Last Name,Phone"].concat(
      //   customerInfo.map(
      //     (contact: ResultItem) =>
      //       `${contact.id},${contact.email},${contact.firstname},${contact.lastname},${contact.phone}`
      //   )
      // );

      // const req3 = await fetch("/api/hubspot/update-leads", {
      //   method: "PATCH",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify({ company, idResults }),
      // });
      // if (!req.ok) {
      //   console.error("HTTP error", req.status);
      //   return;
      // }

      // const IDList = await req3.json();
      // console.log("Frontend: Leads were Updated By ID: ", IDList);

      setTimeout(() => {
        setWaiting(false);
        setLoaded(true);
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen w-full justify-center flex flex-col my-6">
      <div className="relative items-center flex flex-col w-full">
        <div className="relative mx-auto space-y-6">
          <div>
            You Successfully created a payment intent. Click on the button below
            to be auto-billed when matching ZIP Codes appear for your area...
          </div>

          <button
            className="bg-blue-500 hover:bg-blue-700 text-white text-center font-bold py-2 px-4 rounded"
            onClick={handleChargeLater}
            disabled={waiting}
          >
            {loaded ? `Successfully Billed` : ``}
            {waiting
              ? `Searching & Billing...`
              : `Search for Leads and Auto-Bill`}
          </button>
        </div>
      </div>
    </div>
  );
}
