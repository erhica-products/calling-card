import { test } from "node:test";
import assert from "node:assert/strict";
import { buildVCard, vcardFilename } from "../src/lib/vcard.js";

const sample = {
  firstName: "First",
  lastName: "Last",
  fullName: "First Last",
  roles: ["Role A", "Role B"],
  organization: { name: "Company, Inc." },
  email: "person@example.com",
  phone: "+10000000000",
  links: [
    { type: "website", url: "https://example.com" },
    { type: "instagram", url: "https://instagram.com/example" },
  ],
};

test("buildVCard emits valid VCARD envelope", () => {
  const vcf = buildVCard(sample);
  assert.match(vcf, /^BEGIN:VCARD\r\nVERSION:3.0\r\n/);
  assert.match(vcf, /END:VCARD\r\n$/);
});

test("buildVCard escapes commas in org name", () => {
  const vcf = buildVCard(sample);
  assert.match(vcf, /ORG:Company\\, Inc\./);
});

test("buildVCard maps social links to X-SOCIALPROFILE and website to URL", () => {
  const vcf = buildVCard(sample);
  assert.match(vcf, /URL:https:\/\/example\.com/);
  assert.match(vcf, /X-SOCIALPROFILE;TYPE=instagram:https:\/\/instagram\.com\/example/);
});

test("vcardFilename slugifies the full name", () => {
  assert.equal(vcardFilename(sample), "first-last.vcf");
});
