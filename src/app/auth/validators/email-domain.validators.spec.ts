import { FormControl } from '@angular/forms';
import { noEmailDomainTypo, noGovDomainTypo } from './email-domain.validators';

describe('noEmailDomainTypo', () => {
  it('passes for an empty value', () => {
    expect(noEmailDomainTypo(new FormControl(''))).toBeNull();
  });

  it('passes for a malformed value with no @', () => {
    expect(noEmailDomainTypo(new FormControl('not-an-email'))).toBeNull();
  });

  const exactKnownDomains = ['gmail.com', 'yahoo.com', 'yahoo.co.in', 'outlook.com', 'hotmail.com', 'rediffmail.com', 'icloud.com'];
  for (const domain of exactKnownDomains) {
    it(`allows an exact match to a known provider (${domain})`, () => {
      expect(noEmailDomainTypo(new FormControl(`user@${domain}`))).toBeNull();
    });
  }

  it('is case-insensitive for an exact match', () => {
    expect(noEmailDomainTypo(new FormControl('User@GMAIL.COM'))).toBeNull();
  });

  it('passes for a genuinely different domain', () => {
    expect(noEmailDomainTypo(new FormControl('user@example.com'))).toBeNull();
  });

  // Single insert/delete/substitute typos (distance exactly 1), no transpositions.
  const typoDomains = ['gmai.com', 'gmail.con', 'gmail.co', 'gnail.com', 'yaho.com'];
  for (const domain of typoDomains) {
    it(`flags likely typo ${domain}`, () => {
      expect(noEmailDomainTypo(new FormControl(`user@${domain}`))).toEqual({ emailDomainTypo: true });
    });
  }
});

describe('noGovDomainTypo', () => {
  it('passes for an empty value', () => {
    expect(noGovDomainTypo(new FormControl(''))).toBeNull();
  });

  it('passes for a non-.in domain', () => {
    expect(noGovDomainTypo(new FormControl('user@example.com'))).toBeNull();
  });

  const validGovDomains = ['telangana.gov.in', 'x.nic.in', 'nic.in', 'cbic.gov.in'];
  for (const domain of validGovDomains) {
    it(`passes for exact ${domain}`, () => {
      expect(noGovDomainTypo(new FormControl(`officer@${domain}`))).toBeNull();
    });
  }

  // Plain Levenshtein (not transposition-aware) — these are single insert/delete/substitute
  // typos, distance exactly 1 from "gov"/"nic".
  const typoDomains = ['telangana.gv.in', 'dept.nc.in', 'x.goc.in'];
  for (const domain of typoDomains) {
    it(`flags likely typo ${domain}`, () => {
      expect(noGovDomainTypo(new FormControl(`officer@${domain}`))).toEqual({ governmentDomainTypo: true });
    });
  }

  const legitimateNonGovDomains = ['acme.co.in', 'school.edu.in', 'firm.org.in', 'iit.ac.in', 'startup.net.in'];
  for (const domain of legitimateNonGovDomains) {
    it(`never false-positives on ${domain}`, () => {
      expect(noGovDomainTypo(new FormControl(`user@${domain}`))).toBeNull();
    });
  }
});
