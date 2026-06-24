import { useAuthStore } from '@/store/authStore';

const KycBanner = () => {
  const { user } = useAuthStore();

  if (user?.role !== 'creator' || user?.kycStatus !== 'Not Started') {
    return null;
  }

  return (
    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mt-4 rounded-md">
      <p className="font-bold">Complete Your KYC</p>
      <p>To receive donations and get a verified badge, you need to complete the KYC process.</p>
      <button className="mt-2 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded">
        Start KYC Process
      </button>
    </div>
  );
};

export default KycBanner;