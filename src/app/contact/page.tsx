import { ContactForm } from "../components/ContactForm";

export default function ContactPage() {
  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-6 py-12">
      <h1 className="text-3xl font-semibold">Contact us</h1>
      <p className="mt-3 text-foreground/80">
        Questions, feedback, or partnership ideas? Send us a message.
      </p>
      <ContactForm />
    </main>
  );
}
