import { TutorBookingBrowser } from "@/components/TutorBookingBrowser";

export default function TutoringRequestPage() {
  return (
    <TutorBookingBrowser
      backHref="/schedule"
      backLabel="Back to Schedule"
      sectionLabel="Tutoring Request"
      title="Choose Your Tutor"
      accentTitle="Book a Session"
      description="Browse every MathMaster tutor, compare specialties and availability, then book the session that fits your goals."
      authRedirect="/tutoring-request"
    />
  );
}
