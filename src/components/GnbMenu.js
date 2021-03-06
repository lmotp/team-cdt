import React from 'react';
import { Link } from 'react-router-dom';

export default function GnbMenu({ scrollTop }) {
  const handleChevron = (e) => {
    e.preventDefault();
    if (e.target.className === 'gnb-menu-item-chevron-down') {
      e.target.className = 'gnb-menu-item-chevron-up';
    } else if (e.target.className === 'gnb-menu-item-chevron-up') {
      e.target.className = 'gnb-menu-item-chevron-down';
    }
  };

  const listItems = [
    { value: 'notice list items', items: ['공지사항'], url: '/notice/board' },
    { value: 'community list item', items: ['자유게시판'], url: '/notice/free' },
    { value: 'recommend list item', items: ['추천게시판'], url: '/notice/recommend/All' },
    { value: 'video list item', items: ['영상콘텐츠'], url: '/video_list' },
  ];
  const menuList = listItems.map((item, index) => {
    return (
      <>
        {item.items.map((smallItem) => {
          return (
            <li className="list-item" key={index} onClick={scrollTop}>
              <Link to={item.url} aria-label={item.value}>
                {smallItem}
              </Link>
            </li>
          );
        })}
      </>
    );
  });
  const menuTitle = ['Notice', 'Community', 'Recommend', 'Video'];
  const menu = menuTitle.map((item, index) => {
    return (
      <li key={index} className="gnb-menu-item-chevron-down" onClick={handleChevron}>
        <a href="/" className="gnb-menu-item" aria-label="목록리스트">
          <i className={`fas fa-flag ${item}-icon`}></i>
          <span>{item}</span>
          <i className="fas fa-chevron-down chevron"></i>
        </a>
        <ul className="menu-list">{menuList[index]}</ul>
      </li>
    );
  });

  return (
    <>
      <nav className="gnb-menu">
        <h2 className="visually-hidden">메뉴</h2>
        <ul className="gnb-menu-list">{menu}</ul>
      </nav>
    </>
  );
}
