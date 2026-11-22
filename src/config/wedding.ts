export interface BankAccount {
  id: string;
  role: string;
  holder: string;
  bank: string;
  /** 하이픈(-)을 포함해 보기 좋게 입력해도 복사 시 숫자만 자동 복사됩니다. */
  number: string;
  /** (선택) 카카오페이 송금 링크를 넣으면 '카카오페이' 버튼이 자동 노출됩니다. */
  kakaoPayUrl?: string;
}

export interface ContactPerson {
  role: string;
  name: string;
  phone: string;
}

export interface WeddingPhoto {
  id: number;
  src: string;
  thumb: string;
  alt: string;
  /** 원본 파일 참고용 */
  sourceRef: string;
  aspect?: "portrait" | "landscape";
}

export const WEDDING_CONFIG = {
  /** 사이트 기본 메타 정보 (카카오톡/SNS 공유 미리보기) */
  meta: {
    title: "이호민 ♥ 김은정 결혼식에 초대합니다",
    description:
      "2027년 3월 28일 일요일 오후 1시 10분 · 규수당 문래점(SK리더스뷰 2층) 카이타스홀",
    ogImage: "/images/wedding/og-preview.jpg",
  },

  /** 신랑 · 신부 및 양가 혼주 정보 */
  couple: {
    groom: {
      koreanName: "이호민",
      firstName: "호민",
      englishName: "Rhee Homin",
      relation: "장남",
      father: "이동진",
      mother: "김문향",
    },
    bride: {
      koreanName: "김은정",
      firstName: "은정",
      englishName: "Kim Eunjung",
      relation: "차녀",
      father: "김인성",
      mother: "최복경",
    },
  },

  /** 예식 일시 (KST 기준) */
  schedule: {
    /** ISO 8601 (한국 표준시 +09:00) */
    isoDateTime: "2027-03-28T13:10:00+09:00",
    year: 2027,
    month: 3,
    day: 28,
    weekdayKo: "일요일",
    weekdayEn: "SUNDAY",
    timeKo: "오후 1시 10분",
    timeEn: "1:10 PM",
    displayDateDot: "2027. 03. 28",
    displayFullKo: "2027년 3월 28일 일요일 오후 1시 10분",
    durationMinutes: 120,
  },

  /** 모시는 글 (원하시는 문구로 자유롭게 수정하실 수 있습니다) */
  greeting: {
    kicker: "INVITATION",
    title: "따스한 봄날,\n저희 두 사람 하나가 됩니다",
    paragraphs: [
      "싱그러운 풀빛이 번져가는 봄날,\n서로의 가장 따뜻한 편이 되어주기로 약속했습니다.",
      "함께 웃고 걸어온 시간처럼\n앞으로의 계절도 서로를 아끼며\n단단하고 다정하게 채워가겠습니다.",
      "저희의 새로운 시작을 알리는 자리에\n귀한 발걸음으로 축복해 주시면\n더없는 기쁨으로 간직하겠습니다.",
    ],
  },

  /** 예식장 · 교통 · 주차 안내 */
  venue: {
    name: "규수당 문래점",
    building: "SK리더스뷰 2층",
    hall: "카이타스홀",
    fullDisplayName: "규수당 문래점 (SK리더스뷰 2층) 카이타스홀",
    roadAddress: "서울특별시 영등포구 문래로 164, SK리더스뷰 2층 규수당",
    shortAddress: "서울특별시 영등포구 문래로 164",
    phone: "02.332.9000",
    phoneTel: "02-332-9000",
    lat: 37.517436,
    lng: 126.899788,
    transport: {
      subway: {
        title: "지하철 안내",
        lines: [
          "지하철 2호선 문래역 5번 출구 도보 6분 거리",
          "문래동주민센터 방향으로 직진 300m",
        ],
      },
      bus: {
        title: "버스 안내",
        stopName: "문래역 정류장 하차",
        routes: [
          { type: "간선", color: "#3D6CB9", numbers: "641" },
          { type: "지선", color: "#528C5C", numbers: "6211, 6516, 6625" },
          { type: "마을", color: "#7B9E59", numbers: "영등포05, 영등포12" },
        ],
      },
      parking: {
        title: "주차 안내",
        highlight: "2시간 무료 주차",
        lines: [
          "웨딩홀 내 주차 | SK리더스뷰 지하 3층",
          "* 주차장 만차 시 인근 에이스하이테크시티 주차 후 등록",
        ],
      },
    },
  },

  /**
   * 연락처 (배포 전 실제 전화번호로 수정해 주세요)
   * phone 값을 비워두면 해당 인물의 전화/문자 버튼은 비활성화(준비중) 표시됩니다.
   */
  contacts: {
    groomSide: [
      { role: "신랑", name: "이호민", phone: "" },
      { role: "신랑 아버지", name: "이동진", phone: "" },
      { role: "신랑 어머니", name: "김문향", phone: "" },
    ] as ContactPerson[],
    brideSide: [
      { role: "신부", name: "김은정", phone: "" },
      { role: "신부 아버지", name: "김인성", phone: "" },
      { role: "신부 어머니", name: "최복경", phone: "" },
    ] as ContactPerson[],
  },

  /**
   * 마음 전하실 곳 (총 6명 계좌번호 — 아래 bank, number를 실제 계좌로 수정해 주세요)
   * ※ 복사 버튼을 누르면 하이픈(-)과 공백을 제외한 '숫자만' 클립보드에 복사됩니다.
   */
  accounts: {
    description:
      "멀리서도 축하의 마음을 전해 주시는 모든 분들께\n진심으로 감사드립니다.",
    groomSide: [
      {
        id: "groom-father",
        role: "아버지",
        holder: "이동진",
        bank: "은행명 입력",
        number: "000-0000-0000-00",
        kakaoPayUrl: "",
      },
      {
        id: "groom-mother",
        role: "어머니",
        holder: "김문향",
        bank: "은행명 입력",
        number: "000-0000-0000-00",
        kakaoPayUrl: "",
      },
      {
        id: "groom",
        role: "신랑",
        holder: "이호민",
        bank: "은행명 입력",
        number: "000-0000-0000-00",
        kakaoPayUrl: "",
      },
    ] as BankAccount[],
    brideSide: [
      {
        id: "bride-father",
        role: "아버지",
        holder: "김인성",
        bank: "은행명 입력",
        number: "000-0000-0000-00",
        kakaoPayUrl: "",
      },
      {
        id: "bride-mother",
        role: "어머니",
        holder: "최복경",
        bank: "은행명 입력",
        number: "000-0000-0000-00",
        kakaoPayUrl: "",
      },
      {
        id: "bride",
        role: "신부",
        holder: "김은정",
        bank: "은행명 입력",
        number: "000-0000-0000-00",
        kakaoPayUrl: "",
      },
    ] as BankAccount[],
  },

  /**
   * 배경음악(BGM) 설정
   * - 공식 YouTube IFrame Player API를 통해 지정된 유튜브 영상을 BGM으로 재생합니다.
   * - 영상 임베드 제한 또는 오프라인 환경에서는 자체 왈츠 신시사이저가 자동 폴백됩니다.
   */
  bgm: {
    youtubeVideoId: "IpcqMYxQXZY",
    youtubeUrl: "https://www.youtube.com/watch?v=IpcqMYxQXZY",
  },

  /**
   * 대표 사진 배치
   * ※ 원본 KakaoTalk_20261122_164655237_14.jpg (14번, 언덕 위 키스 실루엣) -> photo-15.jpg
   */
  featuredPhotos: {
    /** 메인 커버 사진 (14번: 언덕 위 키스 실루엣) */
    heroMain: "/images/wedding/photo-15.jpg",
    /** PC/폴드 좌측 고정 화보 전환용 서브 커버들 */
    heroAlternates: [
      { src: "/images/wedding/photo-15.jpg", label: "01 · Main" },
      { src: "/images/wedding/photo-17.jpg", label: "02 · Veil" },
      { src: "/images/wedding/photo-04.jpg", label: "03 · 03.28" },
      { src: "/images/wedding/photo-13.jpg", label: "04 · Garden" },
    ],
    /** 인사말 아래 감성 4컷 스토리보드 (_15 -> photo-16.jpg) */
    storyInterlude: "/images/wedding/photo-16.jpg",
    /** 캘린더 상단 03 28 풍선 사진 (_03 -> photo-04.jpg) */
    dateBalloon: "/images/wedding/photo-04.jpg",
    /** 엔딩 푸터 사진 (_08 -> photo-09.jpg, 들판으로 달려가는 뒷모습) */
    closingBanner: "/images/wedding/photo-09.jpg",
    /** 꽃과 커플 거울 플랫레이 (_07 -> photo-08.jpg) */
    floralAccent: "/images/wedding/photo-08.jpg",
  },

  /** 웨딩 갤러리 20장 (메인 14번 및 베스트 컷 우선 정렬) */
  gallery: [
    { id: 1, src: "/images/wedding/photo-15.jpg", thumb: "/images/wedding/thumbs/photo-15.jpg", alt: "언덕 위 실루엣 웨딩 화보", sourceRef: "_14", aspect: "portrait" },
    { id: 2, src: "/images/wedding/photo-17.jpg", thumb: "/images/wedding/thumbs/photo-17.jpg", alt: "베일 속 입맞춤", sourceRef: "_16", aspect: "portrait" },
    { id: 3, src: "/images/wedding/photo-04.jpg", thumb: "/images/wedding/thumbs/photo-04.jpg", alt: "03 28 숫자 풍선", sourceRef: "_03", aspect: "portrait" },
    { id: 4, src: "/images/wedding/photo-13.jpg", thumb: "/images/wedding/thumbs/photo-13.jpg", alt: "다정한 미소와 부케", sourceRef: "_12", aspect: "portrait" },
    { id: 5, src: "/images/wedding/photo-01.jpg", thumb: "/images/wedding/thumbs/photo-01.jpg", alt: "버드나무 아래 마주본 두 사람", sourceRef: "00", aspect: "portrait" },
    { id: 6, src: "/images/wedding/photo-02.jpg", thumb: "/images/wedding/thumbs/photo-02.jpg", alt: "흩날리는 롱 베일", sourceRef: "_01", aspect: "portrait" },
    { id: 7, src: "/images/wedding/photo-16.jpg", thumb: "/images/wedding/thumbs/photo-16.jpg", alt: "서로에게 달려가는 4컷", sourceRef: "_15", aspect: "portrait" },
    { id: 8, src: "/images/wedding/photo-06.jpg", thumb: "/images/wedding/thumbs/photo-06.jpg", alt: "꽃다발 너머의 입맞춤", sourceRef: "_05", aspect: "portrait" },
    { id: 9, src: "/images/wedding/photo-14.jpg", thumb: "/images/wedding/thumbs/photo-14.jpg", alt: "푸른 언덕에 나란히 앉아", sourceRef: "_13", aspect: "portrait" },
    { id: 10, src: "/images/wedding/photo-03.jpg", thumb: "/images/wedding/thumbs/photo-03.jpg", alt: "비눗방울과 함께한 순간", sourceRef: "_02", aspect: "portrait" },
    { id: 11, src: "/images/wedding/photo-05.jpg", thumb: "/images/wedding/thumbs/photo-05.jpg", alt: "잔디밭의 웃음", sourceRef: "_04", aspect: "portrait" },
    { id: 12, src: "/images/wedding/photo-07.jpg", thumb: "/images/wedding/thumbs/photo-07.jpg", alt: "다정한 손길", sourceRef: "_06", aspect: "portrait" },
    { id: 13, src: "/images/wedding/photo-08.jpg", thumb: "/images/wedding/thumbs/photo-08.jpg", alt: "꽃과 미니 거울", sourceRef: "_07", aspect: "landscape" },
    { id: 14, src: "/images/wedding/photo-10.jpg", thumb: "/images/wedding/thumbs/photo-10.jpg", alt: "화이트 부케와 장난스러운 미소", sourceRef: "_09", aspect: "portrait" },
    { id: 15, src: "/images/wedding/photo-11.jpg", thumb: "/images/wedding/thumbs/photo-11.jpg", alt: "햇살 아래 나란히", sourceRef: "_10", aspect: "portrait" },
    { id: 16, src: "/images/wedding/photo-12.jpg", thumb: "/images/wedding/thumbs/photo-12.jpg", alt: "선글라스 커플 스냅", sourceRef: "_11", aspect: "portrait" },
    { id: 17, src: "/images/wedding/photo-18.jpg", thumb: "/images/wedding/thumbs/photo-18.jpg", alt: "초록 숲속의 산책", sourceRef: "_17", aspect: "portrait" },
    { id: 18, src: "/images/wedding/photo-19.jpg", thumb: "/images/wedding/thumbs/photo-19.jpg", alt: "팔짱 끼고 나란히", sourceRef: "_18", aspect: "portrait" },
    { id: 19, src: "/images/wedding/photo-20.jpg", thumb: "/images/wedding/thumbs/photo-20.jpg", alt: "잔디 위 피크닉 무드", sourceRef: "_19", aspect: "portrait" },
    { id: 20, src: "/images/wedding/photo-09.jpg", thumb: "/images/wedding/thumbs/photo-09.jpg", alt: "함께 달려가는 미래", sourceRef: "_08", aspect: "portrait" },
  ] as WeddingPhoto[],
} as const;
