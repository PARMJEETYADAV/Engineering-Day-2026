import React, { useEffect, useState } from 'react';
import { HeroSection } from '../../components/home/HeroSection';
import { CountdownSection } from '../../components/home/CountdownSection';
import { AboutSection } from '../../components/home/AboutSection';
import { EventScheduleSection } from '../../components/home/EventScheduleSection';
import { WhyParticipateSection } from '../../components/home/WhyParticipateSection';
import { RegistrationStepsSection } from '../../components/home/RegistrationStepsSection';
import { ImportantInfoSection } from '../../components/home/ImportantInfoSection';
import { FaqSection } from '../../components/home/FaqSection';
import api from '../../services/api';
import { EventItem } from '../../types';
import { DEFAULT_EVENTS } from '../../constants/defaultEvents';

export const HomePage: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>(DEFAULT_EVENTS);

  useEffect(() => {
    api
      .get('/events')
      .then((res) => {
        if (res.data?.success) {
          setEvents(res.data.events);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <HeroSection />
      <CountdownSection />
      <AboutSection />
      <EventScheduleSection events={events} />
      <WhyParticipateSection />
      <RegistrationStepsSection />
      <ImportantInfoSection />
      <FaqSection />
    </div>
  );
};
