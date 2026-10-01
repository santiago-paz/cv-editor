import { AUTHOR } from "./site";

/* Who runs the editor, for the privacy page and the terms. Argentina's data
   law (Ley 25.326, article 6) asks the notice to name the person responsible
   and give an address.

   The address comes from OPERATOR_ADDRESS, so it stays out of git. Both pages
   are built ahead of time, so after you set it in Vercel, deploy again. */

export const OPERATOR = {
  name: AUTHOR.name,
  country: "Argentina",
  email: "santiago.paz.1992@gmail.com",
  address: process.env.OPERATOR_ADDRESS?.trim() ?? "",
};
