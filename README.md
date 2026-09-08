# Doorquest

![License](https://img.shields.io/badge/license-MIT-blue.svg) [![Latest Stable Version](https://img.shields.io/packagist/v/stezkoy/flarum-doorquest.svg)](https://packagist.org/packages/stezkoy/flarum-doorquest) [![Total Downloads](https://img.shields.io/packagist/dt/stezkoy/flarum-doorquest.svg)](https://packagist.org/packages/stezkoy/flarum-doorquest)

A Flarum extension that gates registration behind a question-and-answer challenge. New users must answer a question correctly to register — a simple alternative (or addition) to invites, captchas, and other signup barriers.

[Русская версия](README.ru.md)

## Features

### Q&A Registration Gate
When someone registers, the forum presents a random question from your pool. Entry is only allowed once the answer is correct — keeping bots and unwanted signups out while staying friendly to real users.

### Question Pool
Manage as many questions as you like from the admin panel. Each question lives independently, and the system hands one out at random on every registration attempt.

### Case-Insensitive Answers
Answers are compared case-insensitively, so `Manjaro`, `manjaro` and `MANJARO` all pass — no need to guess the user's exact capitalization.

### Optional Usage Limits
Set a **max uses** per question. Once a question hits its limit it automatically disappears from the pool, so you can rotate questions after a set number of successful registrations. Leave `0` for unlimited.

### Auto-Activation
Choose whether answering correctly immediately activates the new account or whether you still approve it manually.

### Group Assignment
Optionally assign newly registered users to a group, e.g. a "vouched" or verified member group.

## Installation

```bash
composer require stezkoy/flarum-doorquest
php flarum cache:clear
```

## Requirements

- Flarum 2.0
- PHP 8.3+

## Configuration

Open **Admin → Extensions → Doorquest**, then add your questions under the **Questions** tab. For each question set the text, the expected answer, an optional usage limit, whether it auto-activates, and an optional group.

## How It Works

1. A user attempts to register and is asked a random question.
2. They submit their answer along with the question id.
3. If the answer is correct, registration proceeds (and the question's usage counter increments); otherwise it is rejected.
4. If the question has a usage limit that has been reached, it is no longer offered.

## License

MIT
