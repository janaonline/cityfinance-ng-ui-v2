import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

type CardAccent = 'green' | 'blue' | 'orange' | 'gray' | 'indigo';

interface RoleCard {
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  accent: CardAccent;
  col: string;
  route: string[];
  btnLabel: string;
}

interface CommunityCard {
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  accent: CardAccent;
  browseLabel: string;
  btnLabel: string;
  route: string[];
}

interface LandingCardsConfig {
  cards: RoleCard[];
  community: CommunityCard;
}

@Component({
  selector: 'app-landing',
  imports: [CommonModule, RouterLink, MatCardModule, MatIconModule, MatButtonModule],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss',
})
export class LandingComponent implements OnInit {
  private readonly http = inject(HttpClient);

  protected readonly cards = signal<RoleCard[]>([]);
  protected readonly community = signal<CommunityCard | null>(null);

  ngOnInit(): void {
    this.http.get<LandingCardsConfig>('/assets/files/landing-cards.json').subscribe((config) => {
      this.cards.set(config.cards ?? []);
      this.community.set(config.community ?? null);
    });
  }
}
