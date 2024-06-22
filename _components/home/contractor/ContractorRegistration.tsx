"use client";

import React from "react";

interface FormStruct {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  zipCodes: string[];
  stripeId: string;
}

export default function ContractorRegistration() {
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    if (!formData) return;

    const data = Object.fromEntries(formData.entries());

    // Make available on /success for convenience.
    localStorage.setItem("email", data.email as string);

    try {
      // Continue creating a session and starting the autobilling process - Then pass down the newly created stripeId to the contractor.
      const resp = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          zipCode: data.zipCode,
          phone: data.phone,
          company: data.company,
        }),
      });
      if (resp.status === 200) {
        const responseData = await resp.json();
        const checkoutUrl = responseData.url as string;
        const stripeId = responseData.stripeId as string;

        const resp1 = await fetch("/api/contractors", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone,
            company: data.company,
            zipCodes: [data.zipCode],
            stripeId: stripeId,
          }),
        });

        if (resp1.status === 201) {
          const responseData = await resp1.json();
          console.log("Company Created: ", responseData);
          window.location.href = checkoutUrl;
          return;
        } else {
          console.error("Prisma record creation error");
        }
      } else {
        console.error("Stripe session creation error");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="flex flex-col">
      <div className=" relative mx-auto">
        <div className=" bg-white p-8 text-blk rounded-xl shadow-lg">
          <h2 className="text-gray-800 font-bold text-2xl mb-4">
            Welcome, Contractor!
          </h2>
          <form className=" bg-white space-y-2" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="firstName"
                className="block text-sm font-medium text-gray-800"
              >
                First Name
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                placeholder="First Name"
                required
                className="mt-1 block w-full border-gray-300 shadow-sm sm:text-sm rounded-md"
              />
            </div>
            <div>
              <label
                htmlFor="lastName"
                className="block text-sm font-medium text-gray-800"
              >
                Last Name
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                placeholder="Last Name"
                required
                className="mt-1 block w-full border-gray-300 shadow-sm sm:text-sm rounded-md"
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-800"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="Email"
                required
                className="mt-1 block w-full border-gray-300 shadow-sm sm:text-sm rounded-md"
              />
            </div>
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700"
              >
                Phone
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                placeholder="(123)-123-1234"
                required
                className="mt-1 block w-full border-gray-300 shadow-sm sm:text-sm rounded-md"
              />
            </div>
            <div>
              <label
                htmlFor="zipCode"
                className="block text-sm font-medium text-gray-800"
              >
                ZIP Code
              </label>
              <input
                id="zipCode"
                name="zipCode"
                type="text"
                maxLength={5}
                placeholder="ZIP Code"
                required
                className="mt-1 block w-full border-gray-300 shadow-sm sm:text-sm rounded-md"
              />
            </div>
            <div>
              <label
                htmlFor="company"
                className="block text-sm font-medium text-gray-800"
              >
                Company Name
              </label>
              <input
                id="company"
                name="company"
                type="text"
                placeholder="Company Name"
                maxLength={32}
                required
                className="mt-1 block w-full border-gray-300 shadow-sm sm:text-sm rounded-md"
              />
            </div>
            <button
              type="submit"
              className="mt-4 w-full p-2 bg-gray-800 text-white rounded"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
