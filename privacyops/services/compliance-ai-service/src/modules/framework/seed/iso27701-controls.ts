/**
 * ISO 27701:2019 — Privacy Information Management System (PIMS) Controls
 * Extension to ISO 27001 and ISO 27002 for privacy management.
 *
 * Covers:
 *   - Clause 5: PIMS-specific requirements related to ISO 27001
 *   - Clause 6: PIMS-specific guidance related to ISO 27002
 *   - Clause 7: Additional guidance for PII controllers
 *   - Clause 8: Additional guidance for PII processors
 *   - Annex A: PIMS-specific reference control objectives and controls (controllers)
 *   - Annex B: PIMS-specific reference control objectives and controls (processors)
 */

export const ISO27701_FRAMEWORK = {
  name: 'ISO27701',
  version: '2019',
  description:
    'ISO/IEC 27701:2019 — Privacy Information Management System (PIMS). ' +
    'An extension to ISO 27001 and ISO 27002 for privacy information management. ' +
    'Provides requirements and guidance for establishing, implementing, maintaining, ' +
    'and continually improving a Privacy Information Management System (PIMS).',
};

export const ISO27701_CONTROLS = [
  // ────────────────────────────────────────────────────────
  //  Clause 5 – PIMS-specific requirements (ISO 27001 ext.)
  // ────────────────────────────────────────────────────────
  {
    id: 'ISO27701-5.2.1',
    name: 'Understanding the organization and its context',
    description:
      'The organization shall determine external and internal issues relevant to its purpose ' +
      'that affect its ability to achieve the intended outcome(s) of its PIMS, including ' +
      'applicable privacy legislation, regulations, and contractual obligations.',
    category: 'governance',
  },
  {
    id: 'ISO27701-5.2.2',
    name: 'Understanding the needs and expectations of interested parties',
    description:
      'The organization shall determine interested parties relevant to the PIMS, including ' +
      'data subjects, regulators, processors, and controllers, and their requirements.',
    category: 'governance',
  },
  {
    id: 'ISO27701-5.2.3',
    name: 'Determining the scope of the PIMS',
    description:
      'The organization shall determine the boundaries and applicability of the PIMS, ' +
      'considering the processing of PII and applicable privacy requirements.',
    category: 'governance',
  },
  {
    id: 'ISO27701-5.2.4',
    name: 'Privacy Information Management System',
    description:
      'The organization shall establish, implement, maintain, and continually improve a PIMS ' +
      'in accordance with the requirements of this standard.',
    category: 'governance',
  },
  {
    id: 'ISO27701-5.4.1',
    name: 'Actions to address risks and opportunities',
    description:
      'When planning for the PIMS, the organization shall consider privacy risk assessment ' +
      'including risks to PII principals and the organization related to the processing of PII.',
    category: 'risk-management',
  },
  {
    id: 'ISO27701-5.4.2',
    name: 'PII privacy risk assessment',
    description:
      'The organization shall perform and document a PII-related risk assessment that considers ' +
      'risks to PII principals, the consequences of PII processing, and effectiveness of existing controls.',
    category: 'risk-management',
  },

  // ────────────────────────────────────────────────────────
  //  Clause 6 – PIMS-specific guidance (ISO 27002 ext.)
  // ────────────────────────────────────────────────────────
  {
    id: 'ISO27701-6.2.1.1',
    name: 'Information security policy for PII protection',
    description:
      'An information security policy shall include provisions for PII protection aligned ' +
      'with applicable privacy legislation and business requirements.',
    category: 'data-protection',
  },
  {
    id: 'ISO27701-6.3.1.1',
    name: 'Roles and responsibilities for PII processing',
    description:
      'Roles and responsibilities for PII processing shall be clearly defined, documented, ' +
      'and communicated, including designation of a data protection officer where required.',
    category: 'governance',
  },
  {
    id: 'ISO27701-6.4.2.2',
    name: 'PII awareness, education, and training',
    description:
      'All employees and relevant contractors shall receive appropriate privacy awareness ' +
      'education and training, including updates when policies/procedures change.',
    category: 'training',
  },
  {
    id: 'ISO27701-6.5.2.1',
    name: 'Classification of PII',
    description:
      'PII shall be classified in terms of legal requirements, value, criticality, and ' +
      'sensitivity to unauthorized disclosure or modification.',
    category: 'data-protection',
  },
  {
    id: 'ISO27701-6.5.2.2',
    name: 'Labelling of PII',
    description:
      'An appropriate set of procedures for labelling PII shall be developed and implemented ' +
      'in accordance with the classification scheme adopted by the organization.',
    category: 'data-protection',
  },
  {
    id: 'ISO27701-6.5.3.1',
    name: 'Management of removable media containing PII',
    description:
      'Procedures shall be implemented for the management of removable media containing PII, ' +
      'including encryption, access controls, and secure disposal.',
    category: 'data-protection',
  },
  {
    id: 'ISO27701-6.5.3.3',
    name: 'Physical media transfer of PII',
    description:
      'Media containing PII shall be protected against unauthorized access, misuse, or ' +
      'corruption during transportation.',
    category: 'data-protection',
  },
  {
    id: 'ISO27701-6.6.2.1',
    name: 'User access management for PII systems',
    description:
      'Access to systems processing PII shall be controlled through formal user registration, ' +
      'de-registration, and access provisioning processes.',
    category: 'access-control',
  },
  {
    id: 'ISO27701-6.6.2.2',
    name: 'Privileged access to PII',
    description:
      'The allocation and use of privileged access rights to PII processing systems shall be ' +
      'restricted and controlled.',
    category: 'access-control',
  },
  {
    id: 'ISO27701-6.7.1.1',
    name: 'Encryption of PII',
    description:
      'A policy on the use of cryptographic controls for protection of PII shall be developed ' +
      'and implemented, including encryption at rest and in transit.',
    category: 'encryption',
  },
  {
    id: 'ISO27701-6.8.2.7',
    name: 'Secure disposal or re-use of equipment containing PII',
    description:
      'All items of equipment containing PII storage media shall be verified to ensure that ' +
      'any PII and licensed software has been removed or securely overwritten prior to disposal.',
    category: 'data-protection',
  },
  {
    id: 'ISO27701-6.9.3.1',
    name: 'PII data transfer policies and procedures',
    description:
      'Formal transfer policies, procedures, and controls shall be in place to protect the ' +
      'transfer of PII through the use of all types of communication facilities.',
    category: 'data-protection',
  },
  {
    id: 'ISO27701-6.9.4.1',
    name: 'Confidentiality and non-disclosure for PII processing',
    description:
      'Requirements for confidentiality or non-disclosure agreements reflecting the ' +
      'organization\'s needs for the protection of PII shall be identified and documented.',
    category: 'governance',
  },
  {
    id: 'ISO27701-6.10.2.1',
    name: 'Security requirements for PII processing systems',
    description:
      'Information security requirements shall include requirements arising from the processing ' +
      'of PII, privacy by design, and data protection impact assessments.',
    category: 'data-protection',
  },
  {
    id: 'ISO27701-6.10.2.4',
    name: 'PII protection in application development',
    description:
      'PII protection principles including data minimization, purpose limitation, and ' +
      'privacy by design shall be incorporated into application development.',
    category: 'data-protection',
  },
  {
    id: 'ISO27701-6.11.1.2',
    name: 'Addressing PII processing in supplier agreements',
    description:
      'Relevant PII protection requirements shall be established and agreed with each supplier ' +
      'that may access, process, or provide PII processing infrastructure.',
    category: 'vendor-management',
  },
  {
    id: 'ISO27701-6.12.1.2',
    name: 'Reporting PII-related security events',
    description:
      'PII-related information security events shall be reported through appropriate management ' +
      'channels as quickly as possible, including breach notification to authorities and PII principals.',
    category: 'incident-response',
  },
  {
    id: 'ISO27701-6.13.1.1',
    name: 'PII protection in business continuity',
    description:
      'The organization shall determine requirements for the continuity of PII protection in ' +
      'adverse situations and establish processes for business continuity.',
    category: 'business-continuity',
  },
  {
    id: 'ISO27701-6.15.1.1',
    name: 'Privacy regulatory compliance',
    description:
      'All relevant legislative, statutory, regulatory, and contractual requirements related to ' +
      'PII processing shall be explicitly identified, documented, and kept up to date.',
    category: 'compliance',
  },
  {
    id: 'ISO27701-6.15.1.3',
    name: 'Protection of PII records',
    description:
      'Records of PII processing activities shall be protected from loss, destruction, ' +
      'falsification, unauthorized access, and unauthorized release.',
    category: 'data-protection',
  },
  {
    id: 'ISO27701-6.15.2.1',
    name: 'Independent review of PII protection',
    description:
      'The organization\'s approach to managing PII protection and its implementation shall be ' +
      'reviewed independently at planned intervals or when significant changes occur.',
    category: 'audit-logging',
  },

  // ────────────────────────────────────────────────────────
  //  Clause 7 – PII Controllers
  // ────────────────────────────────────────────────────────
  {
    id: 'ISO27701-7.2.1',
    name: 'Identify and document purpose',
    description:
      'The organization shall identify and document the specific purposes for which PII will ' +
      'be processed, ensuring purposes are lawful and clearly defined.',
    category: 'data-protection',
  },
  {
    id: 'ISO27701-7.2.2',
    name: 'Identify lawful basis',
    description:
      'The organization shall determine, document, and comply with the relevant lawful basis ' +
      'for PII processing for each identified purpose (consent, contract, legal obligation, etc.).',
    category: 'compliance',
  },
  {
    id: 'ISO27701-7.2.3',
    name: 'Determine when and how consent is obtained',
    description:
      'Where consent is the lawful basis, the organization shall determine and document a ' +
      'process by which it can demonstrate that consent was obtained from PII principals.',
    category: 'consent-management',
  },
  {
    id: 'ISO27701-7.2.4',
    name: 'Obtain and record consent',
    description:
      'The organization shall obtain and record consent from PII principals as required, ' +
      'ensuring consent is freely given, specific, informed, and unambiguous.',
    category: 'consent-management',
  },
  {
    id: 'ISO27701-7.2.5',
    name: 'Privacy impact assessment',
    description:
      'The organization shall assess the need for, and implement where appropriate, a data ' +
      'protection impact assessment (DPIA) whenever PII processing is likely to result in high risk.',
    category: 'risk-management',
  },
  {
    id: 'ISO27701-7.2.6',
    name: 'Contracts with PII processors',
    description:
      'The organization shall have a written contract with any PII processor that processes ' +
      'PII on its behalf, including obligations on the processor.',
    category: 'vendor-management',
  },
  {
    id: 'ISO27701-7.2.7',
    name: 'Joint PII controller',
    description:
      'The organization shall determine respective responsibilities for compliance with ' +
      'applicable PII protection obligations with any joint PII controller.',
    category: 'governance',
  },
  {
    id: 'ISO27701-7.2.8',
    name: 'Records related to PII processing',
    description:
      'The organization shall maintain records of PII processing activities, including ' +
      'categories, purposes, recipients, transfers, and retention periods.',
    category: 'documentation',
  },
  {
    id: 'ISO27701-7.3.1',
    name: 'Obligation to PII principals – Notice',
    description:
      'The organization shall provide clear and accessible notice/information to PII principals ' +
      'about PII processing, including purpose, legal basis, rights, and contact information.',
    category: 'transparency',
  },
  {
    id: 'ISO27701-7.3.2',
    name: 'Obligation to PII principals – Consent management',
    description:
      'The organization shall provide mechanisms for PII principals to modify or withdraw ' +
      'their consent easily and effectively.',
    category: 'consent-management',
  },
  {
    id: 'ISO27701-7.3.3',
    name: 'Obligation to PII principals – Access',
    description:
      'The organization shall provide PII principals the ability to access their PII upon ' +
      'request and within applicable timelines.',
    category: 'data-subject-rights',
  },
  {
    id: 'ISO27701-7.3.4',
    name: 'Obligation to PII principals – Rectification and erasure',
    description:
      'The organization shall provide mechanisms for PII principals to request correction ' +
      'or erasure of their PII, and process such requests in compliance with applicable laws.',
    category: 'data-subject-rights',
  },
  {
    id: 'ISO27701-7.3.5',
    name: 'Obligation to PII principals – Objection',
    description:
      'The organization shall provide a mechanism for PII principals to object to processing, ' +
      'and cease processing when objection is received unless a lawful exception applies.',
    category: 'data-subject-rights',
  },
  {
    id: 'ISO27701-7.3.6',
    name: 'Obligation to PII principals – Data portability',
    description:
      'The organization shall provide PII principals with their data in a commonly used, ' +
      'machine-readable format upon request.',
    category: 'data-subject-rights',
  },
  {
    id: 'ISO27701-7.3.7',
    name: 'Obligation to PII principals – Automated decision-making',
    description:
      'The organization shall identify and address situations where decisions are made solely ' +
      'based on automated processing, providing safeguards including the right to obtain human intervention.',
    category: 'data-subject-rights',
  },
  {
    id: 'ISO27701-7.4.1',
    name: 'Limit collection',
    description:
      'The organization shall limit the collection of PII to that which is adequate, relevant, ' +
      'and limited to what is necessary (data minimization).',
    category: 'data-protection',
  },
  {
    id: 'ISO27701-7.4.2',
    name: 'Limit processing',
    description:
      'The organization shall limit the processing of PII to that which is adequate, relevant, ' +
      'and limited to what is necessary for the identified purposes.',
    category: 'data-protection',
  },
  {
    id: 'ISO27701-7.4.3',
    name: 'Accuracy and quality',
    description:
      'The organization shall ensure the PII processed is accurate and, where necessary, kept up to date.',
    category: 'data-protection',
  },
  {
    id: 'ISO27701-7.4.4',
    name: 'PII minimization objectives',
    description:
      'The organization shall define and document data minimization objectives and identify ' +
      'mechanisms to meet these objectives, including de-identification and anonymization.',
    category: 'data-protection',
  },
  {
    id: 'ISO27701-7.4.5',
    name: 'PII de-identification and deletion at end of processing',
    description:
      'The organization shall delete PII or render it non-identifiable when no longer needed ' +
      'for the identified purposes, unless required by law to retain.',
    category: 'data-retention',
  },
  {
    id: 'ISO27701-7.4.6',
    name: 'Temporary files',
    description:
      'Temporary files created as a result of PII processing shall be disposed of within a ' +
      'documented period following established procedures.',
    category: 'data-retention',
  },
  {
    id: 'ISO27701-7.4.7',
    name: 'Retention',
    description:
      'PII shall not be kept longer than necessary for the purposes for which it is processed. ' +
      'Documented retention schedules shall be established and enforced.',
    category: 'data-retention',
  },
  {
    id: 'ISO27701-7.4.8',
    name: 'Disposal',
    description:
      'The organization shall have documented policies and procedures for the secure disposal ' +
      'of PII, including mechanisms for secure deletion and destruction.',
    category: 'data-retention',
  },
  {
    id: 'ISO27701-7.4.9',
    name: 'PII transmission controls',
    description:
      'The organization shall implement controls to govern the transmission of PII, including ' +
      'encryption, secure transfer protocols, and data loss prevention.',
    category: 'encryption',
  },
  {
    id: 'ISO27701-7.5.1',
    name: 'Identify basis for PII transfer to third countries',
    description:
      'The organization shall identify and document the basis for transfers of PII to other ' +
      'jurisdictions, including adequacy decisions, standard contractual clauses, or binding corporate rules.',
    category: 'data-transfer',
  },
  {
    id: 'ISO27701-7.5.2',
    name: 'Countries and organizations to which PII can be transferred',
    description:
      'The organization shall specify and document the countries and international organizations ' +
      'to which PII can potentially be transferred.',
    category: 'data-transfer',
  },
  {
    id: 'ISO27701-7.5.3',
    name: 'Records of PII transfers',
    description:
      'The organization shall record transfers of PII and ensure adequate safeguards are ' +
      'documented and maintained for all cross-border data flows.',
    category: 'data-transfer',
  },

  // ────────────────────────────────────────────────────────
  //  Clause 8 – PII Processors
  // ────────────────────────────────────────────────────────
  {
    id: 'ISO27701-8.2.1',
    name: 'Customer agreement for PII processing',
    description:
      'The organization acting as a PII processor shall process PII only on documented ' +
      'instructions from the PII controller, and the contract shall address relevant requirements.',
    category: 'vendor-management',
  },
  {
    id: 'ISO27701-8.2.2',
    name: 'Organization\'s purposes',
    description:
      'The organization shall not process PII for its own purposes unless such processing is ' +
      'authorized by the PII controller or required by applicable law.',
    category: 'governance',
  },
  {
    id: 'ISO27701-8.2.3',
    name: 'Marketing and advertising use',
    description:
      'The organization shall not use PII processed under a contract for the purposes of ' +
      'marketing and advertising without establishing consent from the PII principal.',
    category: 'consent-management',
  },
  {
    id: 'ISO27701-8.2.4',
    name: 'Infringing instruction',
    description:
      'The organization shall inform the PII controller if, in its opinion, a processing ' +
      'instruction infringes applicable legislation or regulation.',
    category: 'compliance',
  },
  {
    id: 'ISO27701-8.2.5',
    name: 'Customer obligations',
    description:
      'The organization shall provide the customer with appropriate information to demonstrate ' +
      'compliance with obligations as agreed, and as required by applicable legislation.',
    category: 'documentation',
  },
  {
    id: 'ISO27701-8.3.1',
    name: 'Obligations to PII principals (processor)',
    description:
      'The organization shall provide the PII controller with the means to comply with PII ' +
      'principal rights (access, rectification, erasure, portability) and fulfill obligations.',
    category: 'data-subject-rights',
  },
  {
    id: 'ISO27701-8.4.1',
    name: 'Temporary files (processor)',
    description:
      'The organization shall ensure temporary files containing PII are disposed of in a ' +
      'timely manner in accordance with documented procedures.',
    category: 'data-retention',
  },
  {
    id: 'ISO27701-8.4.2',
    name: 'Return, transfer, or disposal of PII',
    description:
      'The organization shall provide the ability to return, transfer, and/or dispose of PII ' +
      'in a secure manner and within an agreed-upon timeframe upon termination of contract.',
    category: 'data-retention',
  },
  {
    id: 'ISO27701-8.4.3',
    name: 'PII transmission controls (processor)',
    description:
      'The organization shall encrypt PII transmitted over public data-transmission networks ' +
      'and implement appropriate transmission controls.',
    category: 'encryption',
  },
  {
    id: 'ISO27701-8.5.1',
    name: 'Basis for PII transfer between jurisdictions (processor)',
    description:
      'The organization shall inform the customer in a timely manner of any legally binding ' +
      'request for disclosure of PII, as well as any intended changes concerning international transfers.',
    category: 'data-transfer',
  },
  {
    id: 'ISO27701-8.5.2',
    name: 'Countries and organizations to which PII can be transferred (processor)',
    description:
      'The organization shall specify and document countries and organizations to which PII ' +
      'can potentially be transferred, and ensure adequate safeguards are maintained.',
    category: 'data-transfer',
  },
  {
    id: 'ISO27701-8.5.3',
    name: 'Records of PII disclosure to third parties',
    description:
      'The organization shall record disclosures of PII to third parties, including what was ' +
      'disclosed, to whom, at what time, and the legal basis for the disclosure.',
    category: 'audit-logging',
  },
  {
    id: 'ISO27701-8.5.4',
    name: 'Notification of PII disclosure requests',
    description:
      'The organization shall notify the PII controller about any request for disclosure of ' +
      'PII by a law enforcement authority, unless prohibited by applicable law.',
    category: 'incident-response',
  },
  {
    id: 'ISO27701-8.5.5',
    name: 'Legally binding PII disclosures',
    description:
      'The organization shall reject any requests for PII disclosure that are not legally ' +
      'binding and consult with the PII controller before making any disclosures.',
    category: 'compliance',
  },
  {
    id: 'ISO27701-8.5.6',
    name: 'Disclosure of sub-contractors used to process PII',
    description:
      'The organization shall disclose to the customer any use of sub-contractors to process PII ' +
      'before engagement, obtaining authorization and documenting obligations.',
    category: 'vendor-management',
  },
  {
    id: 'ISO27701-8.5.7',
    name: 'Engagement of a sub-contractor to process PII',
    description:
      'The organization shall have a written contract with sub-contractors processing PII that ' +
      'provides at least the same level of PII protection as the original contract.',
    category: 'vendor-management',
  },
  {
    id: 'ISO27701-8.5.8',
    name: 'Change of sub-contractor to process PII',
    description:
      'The organization shall inform the customer of any intended changes concerning the ' +
      'addition or replacement of sub-contractors to process PII, giving opportunity to object.',
    category: 'vendor-management',
  },
];
