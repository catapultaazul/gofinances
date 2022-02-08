import React from "react";

import { Container, Title, Ammount } from "./styles";

interface Props {
  title: string;
  ammount: string;
  color: string;
}

export function HistoryCard({ title, ammount, color }: Props) {
  return (
    <Container color={color}>
      <Title>{title}</Title>
      <Ammount>{ammount}</Ammount>
    </Container>
  );
}
