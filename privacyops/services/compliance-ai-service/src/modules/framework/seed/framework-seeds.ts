/**
 * Pre-built compliance framework definitions with full control sets.
 * These can be seeded per-tenant via the FrameworkSeedService.
 */

import { ISO27701_FRAMEWORK, ISO27701_CONTROLS } from './iso27701-controls';

export interface FrameworkSeed {
  name: string;
  version: string;
  description: string;
  controls: {
    id: string;
    name: string;
    description: string;
    category: string;
  }[];
}

export const FRAMEWORK_SEEDS: Record<string, FrameworkSeed> = {
  ISO27701: {
    ...ISO27701_FRAMEWORK,
    controls: ISO27701_CONTROLS,
  },

  GDPR: {
    name: 'GDPR',
    version: '2016/679',
    description:
      'General Data Protection Regulation (EU) 2016/679 — Comprehensive data protection ' +
      'regulation covering lawful basis, data subject rights, breach notification, DPIAs, ' +
      'international transfers, and accountability.',
    controls: [
      { id: 'GDPR-5.1', name: 'Lawfulness, fairness, and transparency', description: 'Personal data shall be processed lawfully, fairly, and in a transparent manner.', category: 'data-protection' },
      { id: 'GDPR-5.2', name: 'Purpose limitation', description: 'Personal data shall be collected for specified, explicit, and legitimate purposes.', category: 'data-protection' },
      { id: 'GDPR-5.3', name: 'Data minimisation', description: 'Personal data shall be adequate, relevant, and limited to what is necessary.', category: 'data-protection' },
      { id: 'GDPR-5.4', name: 'Accuracy', description: 'Personal data shall be accurate and, where necessary, kept up to date.', category: 'data-protection' },
      { id: 'GDPR-5.5', name: 'Storage limitation', description: 'Personal data shall be kept for no longer than is necessary.', category: 'data-retention' },
      { id: 'GDPR-5.6', name: 'Integrity and confidentiality', description: 'Personal data shall be processed with appropriate security measures.', category: 'encryption' },
      { id: 'GDPR-6', name: 'Lawfulness of processing', description: 'Processing shall only be lawful if at least one legal basis applies.', category: 'compliance' },
      { id: 'GDPR-7', name: 'Conditions for consent', description: 'Where consent is the basis, the controller must demonstrate the data subject has consented.', category: 'consent-management' },
      { id: 'GDPR-12', name: 'Transparent information and communication', description: 'The controller shall provide information in a concise, transparent, and easily accessible form.', category: 'transparency' },
      { id: 'GDPR-13', name: 'Information to be provided – direct collection', description: 'Information shall be provided at the time personal data is obtained from the data subject.', category: 'transparency' },
      { id: 'GDPR-15', name: 'Right of access', description: 'Data subjects have the right to obtain confirmation and access to their personal data.', category: 'data-subject-rights' },
      { id: 'GDPR-16', name: 'Right to rectification', description: 'Data subjects have the right to rectification of inaccurate personal data.', category: 'data-subject-rights' },
      { id: 'GDPR-17', name: 'Right to erasure', description: 'Data subjects have the right to erasure of personal data (right to be forgotten).', category: 'data-subject-rights' },
      { id: 'GDPR-18', name: 'Right to restriction of processing', description: 'Data subjects have the right to restrict processing under certain conditions.', category: 'data-subject-rights' },
      { id: 'GDPR-20', name: 'Right to data portability', description: 'Data subjects have the right to receive their data in a structured, machine-readable format.', category: 'data-subject-rights' },
      { id: 'GDPR-21', name: 'Right to object', description: 'Data subjects have the right to object to processing based on legitimate interests or direct marketing.', category: 'data-subject-rights' },
      { id: 'GDPR-25', name: 'Data protection by design and by default', description: 'The controller shall implement appropriate technical and organisational measures for data protection.', category: 'data-protection' },
      { id: 'GDPR-28', name: 'Processor obligations', description: 'Processing by a processor shall be governed by a contract setting out subject-matter and obligations.', category: 'vendor-management' },
      { id: 'GDPR-30', name: 'Records of processing activities', description: 'Each controller/processor shall maintain records of processing activities.', category: 'documentation' },
      { id: 'GDPR-32', name: 'Security of processing', description: 'The controller and processor shall implement appropriate technical and organisational security measures.', category: 'encryption' },
      { id: 'GDPR-33', name: 'Notification of a personal data breach to supervisory authority', description: 'In the case of a personal data breach, the controller shall notify the supervisory authority within 72 hours.', category: 'incident-response' },
      { id: 'GDPR-34', name: 'Communication of breach to data subjects', description: 'When a breach is likely to result in high risk, the controller shall communicate the breach to data subjects.', category: 'incident-response' },
      { id: 'GDPR-35', name: 'Data protection impact assessment', description: 'A DPIA shall be carried out where processing is likely to result in a high risk.', category: 'risk-management' },
      { id: 'GDPR-37', name: 'Designation of a DPO', description: 'A Data Protection Officer shall be designated where required.', category: 'governance' },
      { id: 'GDPR-44', name: 'General principle for transfers', description: 'Any transfer of personal data to a third country shall only take place with appropriate safeguards.', category: 'data-transfer' },
    ],
  },

  CCPA: {
    name: 'CCPA',
    version: '2020',
    description:
      'California Consumer Privacy Act (CCPA/CPRA) — Consumer privacy rights including ' +
      'right to know, delete, opt-out, and non-discrimination for California residents.',
    controls: [
      { id: 'CCPA-1798.100', name: 'Right to know', description: 'Consumers have the right to know what personal information is collected, used, shared, or sold.', category: 'transparency' },
      { id: 'CCPA-1798.105', name: 'Right to delete', description: 'Consumers have the right to request deletion of personal information collected.', category: 'data-subject-rights' },
      { id: 'CCPA-1798.106', name: 'Right to correct', description: 'Consumers have the right to correct inaccurate personal information.', category: 'data-subject-rights' },
      { id: 'CCPA-1798.110', name: 'Right to access', description: 'Consumers have the right to request specific pieces of personal information collected.', category: 'data-subject-rights' },
      { id: 'CCPA-1798.115', name: 'Right to know – business practices', description: 'Consumers have the right to know about the business\'s selling and sharing practices.', category: 'transparency' },
      { id: 'CCPA-1798.120', name: 'Right to opt-out of sale/sharing', description: 'Consumers have the right to opt-out of the sale or sharing of their personal information.', category: 'consent-management' },
      { id: 'CCPA-1798.121', name: 'Right to limit use of sensitive information', description: 'Consumers have the right to limit the use and disclosure of sensitive personal information.', category: 'data-protection' },
      { id: 'CCPA-1798.125', name: 'Right to non-discrimination', description: 'Consumers shall not be discriminated against for exercising their privacy rights.', category: 'compliance' },
      { id: 'CCPA-1798.130', name: 'Methods for requests', description: 'Businesses shall provide at least two methods for consumers to submit requests.', category: 'data-subject-rights' },
      { id: 'CCPA-1798.135', name: 'Do Not Sell or Share link', description: 'A clear and conspicuous "Do Not Sell or Share My Personal Information" link shall be provided.', category: 'transparency' },
      { id: 'CCPA-1798.140', name: 'Notice at collection', description: 'Businesses shall inform consumers at or before the point of collection about the categories of PI collected.', category: 'transparency' },
      { id: 'CCPA-1798.145', name: 'Privacy policy', description: 'The business shall make a privacy policy available to consumers.', category: 'documentation' },
      { id: 'CCPA-1798.150', name: 'Service provider obligations', description: 'Service providers shall not retain, use, or disclose PI for any purpose other than specified in the contract.', category: 'vendor-management' },
      { id: 'CCPA-1798.185', name: 'Data security', description: 'Businesses shall implement and maintain reasonable security procedures and practices.', category: 'data-protection' },
    ],
  },

  HIPAA: {
    name: 'HIPAA',
    version: '2013',
    description:
      'Health Insurance Portability and Accountability Act — Protects sensitive patient health ' +
      'information (PHI) including Privacy Rule, Security Rule, and Breach Notification Rule.',
    controls: [
      { id: 'HIPAA-164.308(a)(1)', name: 'Security management process', description: 'Implement policies and procedures to prevent, detect, contain, and correct security violations.', category: 'governance' },
      { id: 'HIPAA-164.308(a)(3)', name: 'Workforce security', description: 'Implement policies and procedures to ensure workforce members have appropriate access to ePHI.', category: 'access-control' },
      { id: 'HIPAA-164.308(a)(4)', name: 'Information access management', description: 'Implement policies and procedures for authorizing access to ePHI.', category: 'access-control' },
      { id: 'HIPAA-164.308(a)(5)', name: 'Security awareness and training', description: 'Implement a security awareness and training program for all workforce members.', category: 'training' },
      { id: 'HIPAA-164.308(a)(6)', name: 'Security incident procedures', description: 'Implement policies and procedures to address security incidents.', category: 'incident-response' },
      { id: 'HIPAA-164.308(a)(7)', name: 'Contingency plan', description: 'Establish and implement policies and procedures for responding to emergencies.', category: 'business-continuity' },
      { id: 'HIPAA-164.308(a)(8)', name: 'Evaluation', description: 'Perform periodic technical and nontechnical evaluation of security.', category: 'audit-logging' },
      { id: 'HIPAA-164.310(a)', name: 'Facility access controls', description: 'Implement policies and procedures to limit physical access to information systems.', category: 'access-control' },
      { id: 'HIPAA-164.310(d)', name: 'Device and media controls', description: 'Implement policies governing the receipt and removal of hardware and electronic media.', category: 'data-protection' },
      { id: 'HIPAA-164.312(a)', name: 'Access control (technical)', description: 'Implement technical policies and procedures for electronic systems that maintain ePHI.', category: 'access-control' },
      { id: 'HIPAA-164.312(b)', name: 'Audit controls', description: 'Implement hardware, software, and procedural mechanisms to record and examine access to ePHI.', category: 'audit-logging' },
      { id: 'HIPAA-164.312(c)', name: 'Integrity controls', description: 'Implement policies and procedures to protect ePHI from improper alteration or destruction.', category: 'data-protection' },
      { id: 'HIPAA-164.312(d)', name: 'Person or entity authentication', description: 'Implement procedures to verify the identity of persons seeking access to ePHI.', category: 'access-control' },
      { id: 'HIPAA-164.312(e)', name: 'Transmission security', description: 'Implement technical security measures to guard against unauthorized access to ePHI during transmission.', category: 'encryption' },
      { id: 'HIPAA-164.502', name: 'Uses and disclosures of PHI', description: 'A covered entity may not use or disclose PHI except as permitted or required.', category: 'data-protection' },
      { id: 'HIPAA-164.524', name: 'Access of individuals to PHI', description: 'Individuals have the right to inspect and obtain a copy of PHI about them.', category: 'data-subject-rights' },
      { id: 'HIPAA-164.526', name: 'Amendment of PHI', description: 'An individual has the right to request amendment of PHI.', category: 'data-subject-rights' },
      { id: 'HIPAA-164.528', name: 'Accounting of disclosures', description: 'An individual has the right to receive an accounting of disclosures of PHI.', category: 'audit-logging' },
      { id: 'HIPAA-164.530', name: 'Notice of privacy practices', description: 'A covered entity shall provide notice of its privacy practices.', category: 'transparency' },
      { id: 'HIPAA-164.404', name: 'Breach notification to individuals', description: 'A covered entity shall notify individuals of a breach of unsecured PHI without unreasonable delay.', category: 'incident-response' },
    ],
  },
};

export const ALL_FRAMEWORK_NAMES = Object.keys(FRAMEWORK_SEEDS);
