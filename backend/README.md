<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ pnpm install
```

## Compile and run the project

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## Run tests

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ pnpm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).

# 기계식 키보드 리뷰 커뮤니티 - 백엔드

NestJS 기반의 기계식 키보드 리뷰 커뮤니티 백엔드 API

## 기술 스택

- **Framework**: NestJS
- **Database**: PostgreSQL
- **ORM**: TypeORM
- **Authentication**: JWT
- **Language**: TypeScript

## 설치 및 실행

### 1. 의존성 설치

```bash
pnpm install
```

### 2. 데이터베이스 설정

PostgreSQL을 설치하고 데이터베이스를 생성하세요:

```sql
CREATE DATABASE keyboard_community;
```

### 3. 환경 변수 설정

`.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
# 데이터베이스 설정 (PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=keyboard_community

# JWT 설정
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# 서버 설정
PORT=3000
```

### 4. 서버 실행

```bash
# 개발 모드
pnpm run start:dev

# 프로덕션 모드
pnpm run build
pnpm run start:prod
```

## API 엔드포인트

### 인증

- `POST /auth/register` - 회원가입
- `POST /auth/login` - 로그인

### 리뷰

- `GET /reviews` - 리뷰 목록 조회 (페이지네이션)
- `POST /reviews` - 리뷰 작성 (인증 필요)
- `GET /reviews/:id` - 리뷰 상세 조회
- `GET /reviews/search` - 리뷰 검색
- `GET /reviews/user/:userId` - 사용자별 리뷰 조회

## 데이터베이스 스키마

### Users 테이블

- id (UUID, Primary Key)
- username (String, Unique)
- email (String, Unique)
- password (String, Hashed)
- profileImage (String, Optional)
- isVerified (Boolean)
- createdAt (DateTime)
- updatedAt (DateTime)

### Reviews 테이블

- id (UUID, Primary Key)
- title (String)
- content (Text)
- keyboardFrame (String)
- switchType (String)
- keycapType (String)
- deskPad (String, Optional)
- deskType (String, Optional)
- soundRating (Decimal)
- feelRating (Decimal)
- overallRating (Decimal)
- tags (Array)
- userId (UUID, Foreign Key)
- createdAt (DateTime)
- updatedAt (DateTime)

### ReviewMedia 테이블

- id (UUID, Primary Key)
- filename (String)
- originalName (String)
- mimeType (String)
- size (Number)
- type (Enum: image, audio, video)
- url (String)
- reviewId (UUID, Foreign Key)
- createdAt (DateTime)

## 개발 가이드

### 코드 스타일

```bash
# 린트 검사
pnpm run lint

# 포맷팅
pnpm run format
```

### 테스트

```bash
# 단위 테스트
pnpm run test

# E2E 테스트
pnpm run test:e2e

# 테스트 커버리지
pnpm run test:cov
```
