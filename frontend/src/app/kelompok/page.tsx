import { TeamSection } from '@/components/TeamSection';
import { teamMembers } from '@/data/team';

const KelompokPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background">
      <div className="container mx-auto px-4 py-12">
        <TeamSection
          title="Kelompok 3 IOT"
          subtitle="Profil Pencipta Aplikasi Resto Dashboard"
          members={teamMembers}
        />
      </div>
    </div>
  );
};

export default KelompokPage
