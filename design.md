# Life Level Up — Design System

> Become the Main Character

**Theme:** Dark RPG / Solo Adventure / Hunter System

**Category:** Productivity / Gamification / Self Improvement

**Platform:** Mobile First (iOS / Android)

**Design Philosophy:**
현실의 할 일을 RPG 게임처럼 느끼게 만든다.

사용자는 단순한 Todo 리스트를 보는 것이 아니라 자신의 상태창을 확인하고, 몬스터를 처치하고, 경험치를 획득하며 성장하는 주인공이 되어야 한다.

모든 화면은 "게임 UI"처럼 느껴져야 한다.

---

# Brand Identity

## Keywords

* Hunter
* Dungeon
* Quest
* Level Up
* Status Window
* Growth
* Achievement
* Reward

## Emotional Goals

사용자가 느껴야 할 감정

* 성장하고 있다
* 강해지고 있다
* 오늘도 경험치를 얻었다
* 게임처럼 재미있다
* 내 인생을 컨트롤하고 있다

---

# Tokens — Colors

## Core Backgrounds

| Name           | Value   | Role       |
| -------------- | ------- | ---------- |
| Abyss Black    | #0B0B0F | 전체 앱 기본 배경 |
| Dungeon Gray   | #181A20 | 카드 배경      |
| Shadow Slate   | #23262F | 강조 카드      |
| Hunter Surface | #2C313D | 선택 상태      |

---

## Text Colors

| Name       | Value   | Role   |
| ---------- | ------- | ------ |
| Pure White | #FFFFFF | 기본 텍스트 |
| Silver Fog | #C9CDD4 | 보조 텍스트 |
| Mist Gray  | #8B93A1 | 설명 텍스트 |

---

## Status Colors

| Name           | Value   | Role  |
| -------------- | ------- | ----- |
| EXP Blue       | #3B82F6 | 경험치   |
| Gold Reward    | #FBBF24 | 골드    |
| Health Red     | #EF4444 | 체력    |
| Success Green  | #22C55E | 성공    |
| Epic Purple    | #7C3AED | 레벨업   |
| Legendary Gold | #FFD700 | 전설 등급 |

---

## Rarity System

### Common

#9CA3AF

### Rare

#3B82F6

### Epic

#7C3AED

### Legendary

#F59E0B

### Mythic

#FF4D6D

---

# Tokens — Typography

## Primary Font

Inter

Weights

* 400
* 500
* 600
* 700

Role

* 상태창
* 퀘스트
* 버튼
* 내비게이션

---

## Display Font

Oswald

Weights

* 500
* 700

Role

* 레벨 표시
* 보스 화면
* 메인 타이틀

---

# Type Scale

| Role          | Size |
| ------------- | ---- |
| Caption       | 12px |
| Small         | 14px |
| Body          | 16px |
| Quest Title   | 18px |
| Card Title    | 24px |
| Section Title | 32px |
| Level Display | 48px |
| Boss Display  | 64px |

---

# Tokens — Spacing

Base Unit

4px

Spacing Scale

4
8
12
16
24
32
48
64
80
96

---

# Border Radius

| Component        | Radius |
| ---------------- | ------ |
| Cards            | 12px   |
| Buttons          | 10px   |
| Inputs           | 8px    |
| Badges           | 999px  |
| Character Avatar | 16px   |

---

# Shadows

Card

0px 4px 16px rgba(0,0,0,0.25)

Floating

0px 8px 24px rgba(0,0,0,0.35)

Level Up Glow

0px 0px 24px rgba(124,58,237,0.45)

Legendary

0px 0px 32px rgba(255,215,0,0.45)

---

# Components

## Primary Action Button

Purpose

중요한 행동

Examples

* 퀘스트 완료
* 보상 수령
* 던전 입장

Style

Background:
#7C3AED

Text:
#FFFFFF

Radius:
10px

Padding:
16px 24px

---

## Secondary Button

Background

#23262F

Text

#FFFFFF

Border

1px solid #3A3F4B

---

## Quest Card

Background

#181A20

Radius

12px

Contains

* 퀘스트 이름
* 경험치
* 골드
* 난이도
* 완료 버튼

---

## Status Card

Background

#23262F

Shows

* 레벨
* 경험치
* 힘
* 지능
* 집중력
* 자기관리

---

## Achievement Card

Background

#181A20

Accent

Legendary Gold

Used For

* 업적
* 배지
* 칭호

---

# Core Screens

## Dashboard

상태창

표시 정보

* 레벨
* 경험치
* 골드
* 오늘의 퀘스트
* 연속 출석

---

## Quest Screen

일일 퀘스트 목록

Examples

* 영어 공부
* 운동
* 개발 공부
* 독서

---

## Character Screen

캐릭터 상태

Attributes

* STR
* INT
* DISC
* CHA
* DEX

---

## Achievement Screen

업적 및 칭호

Examples

* 첫 퀘스트 완료
* 7일 연속 달성
* 레벨 10 달성

---

# Animation Rules

## Level Up

Scale

1.0 → 1.15 → 1.0

Duration

600ms

Glow

Epic Purple

---

## Quest Complete

Check Animation

400ms

Reward Pop

EXP + Gold

---

# Do

* RPG 느낌 유지
* 다크 테마 유지
* 경험치 획득을 강조
* 레벨업 연출 제공
* 상태창 중심 UI

---

# Don't

* 일반 Todo 앱처럼 보이지 않기
* 밝은 배경 사용 금지
* 기업용 대시보드 스타일 금지
* 과도한 컬러 사용 금지
* 평범한 생산성 앱 느낌 금지

---

# Similar Inspirations

* Solo Leveling
* Diablo IV
* World of Warcraft
* Notion Gamification Systems
* Habitica

---

# Agent Instructions

Always design screens as if the user is a hunter progressing through levels.

Every completed task should feel like defeating a monster.

Every dashboard should feel like opening a status window.

Never create generic productivity app interfaces.

The experience must feel rewarding, immersive, and game-like.
