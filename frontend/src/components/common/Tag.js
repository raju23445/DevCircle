import React from 'react';
import { useNavigate } from 'react-router-dom';
const Tag = ({ tag, onClick }) => {
  const nav = useNavigate();
  return (
    <span className="tag" onClick={onClick || (() => nav(`/questions?tag=${tag}`))}># {tag}</span>
  );
};
export default Tag;
