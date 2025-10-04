// src/app/private/page.tsx
import { redirect } from 'next/navigation';

export default function PrivateIndexRedirect() {
  redirect('/private/panelPrincipal');
}