import React from 'react';

import ContentsHeader from './ContentsHeader';
import ContentsMain from './ContentsMain';
import ContentsFooter from './ContentsFooter';
import Footer from './Footer';

import './../../styles/layouts/contents.css';

export default function Contents() {
  return (
    <div className="contents">
      <ContentsHeader></ContentsHeader>
      <ContentsMain></ContentsMain>
      <ContentsFooter></ContentsFooter>
      <Footer></Footer>
    </div>
  );
}
