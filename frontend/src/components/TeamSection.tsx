import Image from 'next/image';
import { TeamMember } from '@/types';
import { Card, CardContent } from './ui/Card';

interface TeamSectionProps {
  title: string;
  subtitle?: string;
  members: TeamMember[];
}

const MemberCard = ({ member }: { member: TeamMember }) => (
  <Card className="h-full text-center shadow-sm transition hover:shadow-md">
    <CardContent className="flex flex-col items-center gap-4 p-6 pt-6">
      <div className="relative h-24 w-24 overflow-hidden rounded-full border border-border bg-muted">
        <Image
          src={member.photo}
          alt={`Foto ${member.name}`}
          fill
          sizes="96px"
          className="object-cover"
        />
      </div>
      <div>
        <p className="text-lg font-semibold">{member.name}</p>
        {member.role && (
          <p className="text-sm text-muted-foreground">{member.role}</p>
        )}
      </div>
    </CardContent>
  </Card>
);

export function TeamSection({ title, subtitle, members }: TeamSectionProps) {
  return (
    <section className="space-y-10">
      <div className="space-y-3 text-center">
        <h1 className="text-3xl font-bold text-primary md:text-4xl">{title}</h1>
        {subtitle && (
          <p className="mx-auto max-w-2xl text-muted-foreground">{subtitle}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {members.map((member) => (
          <MemberCard key={member.id} member={member} />
        ))}
      </div>
    </section>
  );
}
