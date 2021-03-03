import React, { useEffect, FC } from 'react';
import { Home } from '@/containers';
import { strings } from '@/i18n';

const IndexPage: FC = () => {
  useEffect(() => {
    strings.setLanguage('es-US');
  }, []);
  return <Home />;
};

export default IndexPage;
