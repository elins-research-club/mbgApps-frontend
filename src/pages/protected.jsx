import { LogoutButton } from '@/components/logout-button';
import { createClient } from '@/lib/server';

export default function ProtectedPage({ email }) {
  return (
    <div className="flex h-svh w-full items-center justify-center gap-2">
      <p>
        Hello <span>{email}</span>
      </p>
      <LogoutButton />
    </div>
  );
}

export async function getServerSideProps(context) {
  const supabase = createClient({ req: context.req, res: context.res });
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    return {
      redirect: {
        destination: '/auth/login',
        permanent: false,
      },
    };
  }
  return {
    props: {
      email: data.claims.email || '',
    },
  };
}
