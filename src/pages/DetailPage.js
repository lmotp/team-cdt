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

function DetailPage() {
  const [contents, setContents] = useState('');
  const [recomments, setRecomments] = useState([]);
  const [comment, setComment] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const commentCount = comment.length + recomments.length;
  const { post_id } = useParams();

  useEffect(() => {
    axios.post('/detailpage/views', { postId: post_id }).then((res) => console.log('조회수 조회 성공'));
    axios.post('/detailpage', { postId: post_id }).then((res) => setContents(res.data[0]));
  }, [post_id]);

  useEffect(() => {
    axios.post('/detailpage/comment/list', { postId: post_id }).then(({ data }) => {
      setIsLoading(true);
      setComment(data);
    });
    axios.post('/detailpage/recomment/list', { postId: post_id }).then(({ data }) => {
      setIsLoading(true);
      setRecomments(data);
    });
    axios
      .post('/detailpage/comment/count', { postId: post_id, count: commentCount })
      .then((res) => console.log('코멘트갯수가져오기 성공'));
  }, [post_id, isLoading, commentCount]);

  const loadingHandler = () => {
    return setIsLoading(false);
  };

  return (
    <>
      {contents ? (
        <div className="detail-wrap">
          <DetailHeader contents={contents} />
          <DetailContent contents={contents} postId={post_id} />
          <DetailComment loadingHandler={loadingHandler} count={commentCount} />
          {isLoading ? (
            <DetailCommentSection loadingHandler={loadingHandler} comment={comment} recomments={recomments} />
          ) : (
            <Loading />
          )}
          <DetailList category={contents.category} />
        </div>
      ) : (
        <NotFound />
      )}
    </>
  );
}

export default DetailPage;
