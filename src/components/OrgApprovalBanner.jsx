import { AlertCircle, Clock, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function OrgApprovalBanner() {
  const { isOrgPending, isOrgRejected, organization, isOrgOwner } = useAuth();

  if (!isOrgPending && !isOrgRejected) {
    return null;
  }

  if (isOrgPending) {
    return (
      <div className="bg-amber-50 border-b border-amber-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-start gap-3">
          <Clock className="w-5 h-5 text-[#37393B] flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-amber-800">
              Organisasi Menunggu Persetujuan
            </h3>
            <p className="text-xs text-amber-700 mt-1">
              <strong>{organization?.name}</strong> sedang menunggu persetujuan dari administrator. 
              Anda tidak dapat mengakses fitur organisasi hingga disetujui.
            </p>
            {isOrgOwner && (
              <p className="text-xs text-[#37393B] mt-2">
                💡 Tips: Hubungi administrator untuk mempercepat proses persetujuan.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (isOrgRejected) {
    return (
      <div className="bg-red-50 border-b border-red-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-red-800">
              Organisasi Ditolak
            </h3>
            <p className="text-xs text-red-700 mt-1">
              <strong>{organization?.name}</strong> telah ditolak oleh administrator.
            </p>
            {isOrgOwner && (
              <p className="text-xs text-red-600 mt-2">
                Silakan hubungi administrator untuk informasi lebih lanjut atau buat organisasi baru.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
