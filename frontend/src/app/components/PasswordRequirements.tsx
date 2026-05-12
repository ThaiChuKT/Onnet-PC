import { Check, X } from "lucide-react";

interface PasswordRequirementsProps {
  password: string;
}

export function PasswordRequirements({ password }: PasswordRequirementsProps) {
  const requirements = [
    {
      label: "At least 8 characters",
      met: password.length >= 8,
    },
    {
      label: "Contains uppercase letter (A-Z)",
      met: /[A-Z]/.test(password),
    },
    {
      label: "Contains lowercase letter (a-z)",
      met: /[a-z]/.test(password),
    },
    {
      label: "Contains number (0-9)",
      met: /\d/.test(password),
    },
    {
      label: "Contains special character (!@#$%^&*)",
      met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    },
  ];

  const allMet = requirements.every((req) => req.met);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h4 className="font-medium text-sm">Password requirements:</h4>
        {password && (
          <span
            className={`text-xs font-medium ${
              allMet ? "text-green-500" : "text-yellow-500"
            }`}
          >
            {allMet ? "Strong" : "Keep going"}
          </span>
        )}
      </div>
      <div className="space-y-2">
        {requirements.map((req, idx) => (
          <div
            key={idx}
            className={`flex items-center gap-2 text-sm transition-colors ${
              req.met
                ? "text-green-500"
                : password
                  ? "text-muted-foreground"
                  : "text-muted-foreground"
            }`}
          >
            {req.met ? (
              <Check className="w-4 h-4 flex-shrink-0" />
            ) : (
              <X className="w-4 h-4 flex-shrink-0" />
            )}
            <span>{req.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
