import {
  Cedarville_Cursive,
  Dawning_of_a_New_Day,
  Homemade_Apple,
  Kristi,
  Mr_Dafoe,
  Ms_Madi,
  Nanum_Pen_Script,
  Rock_Salt,
  Sacramento,
  Schoolbell,
  Mrs_Saint_Delafield,
  Zeyada,
} from "next/font/google";

const sigSacramento = Sacramento({ subsets: ["latin"], weight: "400", variable: "--font-sig-sacramento" });
const sigZeyada = Zeyada({ subsets: ["latin"], weight: "400", variable: "--font-sig-zeyada" });
const sigNanumPenScript = Nanum_Pen_Script({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-sig-nanum-pen-script",
});
const sigMrDafoe = Mr_Dafoe({ subsets: ["latin"], weight: "400", variable: "--font-sig-mr-dafoe" });
const sigHomemadeApple = Homemade_Apple({ subsets: ["latin"], weight: "400", variable: "--font-sig-homemade-apple" });
const sigRockSalt = Rock_Salt({ subsets: ["latin"], weight: "400", variable: "--font-sig-rock-salt" });
const sigMrsSaintDelafield = Mrs_Saint_Delafield({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-sig-mrs-saint-delafield",
});
const sigCedarvilleCursive = Cedarville_Cursive({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-sig-cedarville-cursive",
});
const sigKristi = Kristi({ subsets: ["latin"], weight: "400", variable: "--font-sig-kristi" });
const sigDawningOfANewDay = Dawning_of_a_New_Day({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-sig-dawning-of-a-new-day",
});
const sigSchoolbell = Schoolbell({ subsets: ["latin"], weight: "400", variable: "--font-sig-schoolbell" });
const sigMsMadi = Ms_Madi({ subsets: ["latin"], weight: "400", variable: "--font-sig-ms-madi" });

/** Apply only on /edit — marketing pages should not pay this font tax. */
export const signatureFontClassName = [
  sigSacramento.variable,
  sigZeyada.variable,
  sigNanumPenScript.variable,
  sigMrDafoe.variable,
  sigHomemadeApple.variable,
  sigRockSalt.variable,
  sigMrsSaintDelafield.variable,
  sigCedarvilleCursive.variable,
  sigKristi.variable,
  sigDawningOfANewDay.variable,
  sigSchoolbell.variable,
  sigMsMadi.variable,
].join(" ");
