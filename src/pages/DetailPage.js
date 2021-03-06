import React, { useEffect, useState } from 'react';
import DetailHeader from '../components/Detail/DetailHeader';
import '../styles/detail.css';
import DetailContent from '../components/Detail/DetailContent';
import DetailComment from '../components/Detail/DetailComment';
import DetailCommentSection from '../components/Detail/DetailCommentSection';
import DetailList from '../components/Detail/DetailList';
import axios from 'axios';
import { useParams } from 'react-router';
import NotFound from './NotFound';
import Loading from './Loading';

function DetailPage({ userId, isLogin }) {
  const [heartCount, setHeartCount] = useState(0);
  const [contents, setContents] = useState('');
  const [recomments, setRecomments] = useState([]);
  const [comment, setComment] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [noticeList, setNoticeList] = useState([]);
  const [scorllHight, setScrollHight] = useState(0);
  const [loading, setLoading] = useState(false);
  const commentCount = comment.length + recomments.length;
  const { post_id } = useParams();

  useEffect(() => {
    window.scrollTo(0, 0);
    axios.post('/api/detailpage', { postId: post_id }).then((res) => setContents(res.data[0]));
  }, [post_id]);

  useEffect(() => {
    axios.post('/api/detailpage/comment/list', { postId: post_id }).then(({ data }) => {
      setIsLoading(true);
      setComment(data);
    });

    axios.post('/api/detailpage/recomment/list', { postId: post_id }).then(({ data }) => {
      setIsLoading(true);
      setRecomments(data);
    });

    axios.post('/api/detailpage/comment/count', { postId: post_id, count: commentCount });

    axios.post('/api/notice/list', { board: contents?.category }).then((res) => {
      setNoticeList(res.data);
      setLoading(true);
    });
  }, [post_id, isLoading, commentCount, contents?.category, heartCount]);

  const loadingHandler = () => {
    return setIsLoading(false);
  };

  return (
    <div className="detail-wrap">
      {loading ? (
        <>
          {contents ? (
            <>
              <DetailHeader contents={contents} userId={userId} postId={post_id} />
              <DetailContent
                contents={contents}
                postId={post_id}
                userId={userId}
                heartCount={heartCount}
                setHeartCount={setHeartCount}
                isLogin={isLogin}
              />
              <DetailComment
                loadingHandler={loadingHandler}
                count={commentCount}
                userId={userId}
                setScrollHight={setScrollHight}
              />
              <DetailCommentSection
                userId={userId}
                loadingHandler={loadingHandler}
                comment={comment}
                recomments={recomments}
                scorllHight={scorllHight}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                isLoading={isLoading}
              />
              <DetailList category={contents.category} noticeList={noticeList} setCurrentPage={setCurrentPage} />
            </>
          ) : (
            <NotFound />
          )}
        </>
      ) : (
        <Loading />
      )}
    </div>
  );
}

export default DetailPage;
