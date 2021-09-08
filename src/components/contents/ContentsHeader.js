import React from 'react';

import MainBanner from './MainBanner';
import SubBanner from './SubBanner';

import './../../styles/layouts/contents.css';

export default function ContentsHeader() {
  return (
    <div className="banner-box">
      <MainBanner></MainBanner>
      <SubBanner></SubBanner>
    </div>
  );
}
