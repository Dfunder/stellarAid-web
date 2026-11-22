import { StakeForm } from "@/components/StakeForm";
import { UnstakeForm } from "@/components/UnstakeForm";

export default function StakePage() {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">
      <h1 className="text-3xl font-semibold">Staking</h1>
      <p className="mt-3 text-foreground/80">
        Stake or unstake assets while keeping balances checked before submit.
      </p>
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <StakeForm />
        <UnstakeForm />
      </div>
    </main>
  );
}
