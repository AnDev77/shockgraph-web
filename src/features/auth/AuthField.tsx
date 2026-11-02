import { useId, type InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & { label: string };
export function AuthField({ label, ...input }: Props) {
  const id = useId();
  return <div className="auth-field"><label htmlFor={id}>{label}</label><input id={id} required {...input} /></div>;
}
