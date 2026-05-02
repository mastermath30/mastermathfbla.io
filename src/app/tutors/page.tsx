import { TutorBookingBrowser } from "@/components/TutorBookingBrowser";

export default function TutorsPage() {
  return (
    <TutorBookingBrowser
      sectionLabel="Tutors"
      title="Find a Tutor"
      accentTitle="Book with Confidence"
      description="Browse tutors, compare strengths, and choose the best fit for your current math goals."
      authRedirect="/tutors"
    />
  );
}
