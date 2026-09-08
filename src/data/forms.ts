/** Add a catalog entry here when a new form filler is ready to use. */
export const FORMS = [
  { id: 'passport', title: 'Passport application', description: 'Fill out FSM Form 500B for your passport application.', category: 'Passport', href: '/?form=passport' },
  { id: 'registration', title: 'Voter registration', description: 'Complete the voter registration application and sworn affidavit.', category: 'Elections', href: '/elections/?form=registration' },
  { id: 'absentee', title: 'Absentee ballot application', description: 'Prepare a request for an absentee ballot.', category: 'Elections', href: '/elections/?form=absentee' },
] as const;
