import Link from "next/link";
import { Button } from "@/components/ui/Button";

const MakeAnImpact = () => {
  return (
    <section className="w-full bg-gradient-to-r from-[#dbeafe] to-[#d1fae5] py-16 sm:py-20 lg:py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Heading */}
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
          Ready to make an impact?
        </h2>

        {/* Subtext */}
        <p className="text-sm sm:text-base text-gray-600 max-w-xl mx-auto mb-8 leading-relaxed">
          Join thousands of donors supporting causes they believe in with complete transparency.
        </p>

        {/* CTA Button */}
        <Link href="/auth/login">
          <Button
            variant="primary"
            size="md"
            className="bg-[#002E6D] hover:bg-[#003d8f] hover:shadow-lg hover:shadow-blue-900/20 
                       hover:-translate-y-0.5 transition-all duration-300 ease-out
                       px-8 py-2.5 text-sm font-semibold rounded-lg"
          >
            Create Your Account
          </Button>
        </Link>
      </div>
    </section>
  );
};

export default MakeAnImpact;
