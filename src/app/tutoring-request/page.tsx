import { TutorBookingBrowser } from "@/components/TutorBookingBrowser";

export default function TutoringRequestPage() {
  return (
    <TutorBookingBrowser
      backHref="/schedule"
      backLabel="Back to Schedule"
      sectionLabel="Tutoring Request"
      title="Tutoring Request"
      accentTitle="Choose a Tutor"
      description="Pick a tutor, select a time, and submit a session request in a few quick steps."
      authRedirect="/tutoring-request"
    />
  );
}
