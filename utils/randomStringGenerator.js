const randomStringGenerator = () => {
  const timestamp = Date.now().toString(36); // 시간 기반
  const random = Math.random().toString(36).substring(2, 8); // 랜덤 6자리
  return (timestamp + random).toUpperCase();
};

module.exports = randomStringGenerator;
