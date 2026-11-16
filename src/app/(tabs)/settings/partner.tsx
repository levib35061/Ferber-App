/** Settings → Partner sharing. */
import React from 'react';

import { PartnerSection } from '../../../components/PartnerSection';
import { Card, SettingsPage } from '../../../components/SettingsUI';

export default function PartnerSettings() {
  return (
    <SettingsPage title="Partner sharing">
      <Card>
        <PartnerSection />
      </Card>
    </SettingsPage>
  );
}
