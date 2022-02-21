import React, { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { HistoryCard } from "../../components/HistoryCard";
import { VictoryPie } from "victory-native";
import {
  Container,
  Header,
  Title,
  Content,
  ChartContainer,
  MonthSelect,
  MonthSelectButton,
  MonthSelectIcon,
  Month,
  LoadContainer,
} from "./styles";
import { categories } from "../../utils/categories";
import { addMonths, subMonths, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { RFValue } from "react-native-responsive-fontsize";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useTheme } from "styled-components";
import { ActivityIndicator } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
export interface TransactionData {
  type: "positive" | "negative";
  name: string;
  ammount: string;
  category: string;
  date: string;
}

interface CategoryData {
  key: string;
  percent: string;
  name: string;
  total: number;
  totalFormatted: string;
  color: string;
}

export function Resume() {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [totalByCategories, setTotalByCategories] = useState<CategoryData[]>(
    []
  );
  const theme = useTheme();

  function handleChangeDate(action: "next" | "prev") {
    if (action === "next") {
      const newDate = addMonths(selectedDate, 1);
      setSelectedDate(newDate);
    } else {
      const newDate = subMonths(selectedDate, 1);
      setSelectedDate(newDate);
    }
  }

  async function loadData() {
    setIsLoading(true);

    const dataKey = "@gofinances:transactions";
    const response = await AsyncStorage.getItem(dataKey);
    const responseFormatted = response ? JSON.parse(response) : [];

    const expenses = responseFormatted.filter(
      (expense: TransactionData) =>
        expense.type === "negative" &&
        new Date(expense.date).getMonth() === selectedDate.getMonth() &&
        new Date(expense.date).getFullYear() === selectedDate.getFullYear()
    );

    const expensesTotal = expenses.reduce(
      (acumullator: number, expense: TransactionData) => {
        return acumullator + Number(expense.ammount);
      },
      0
    );

    const totalByCategory: CategoryData[] = [];

    categories.forEach((category) => {
      let categorySum = 0;

      expenses.forEach((expense: TransactionData) => {
        if (expense.category === category.key) {
          categorySum += Number(expense.ammount);
        }
      });

      if (categorySum > 0) {
        const totalFormatted = categorySum.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        });

        const percent = `${((categorySum / expensesTotal) * 100).toFixed(0)}%`;

        totalByCategory.push({
          key: category.key,
          name: category.name,
          total: categorySum,
          color: category.color,
          totalFormatted,
          percent,
        });
      }
    });
    setTotalByCategories(totalByCategory);
    setIsLoading(false);
  }

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [selectedDate])
  );
  return (
    <Container>
      <Header>
        <Title> Resumo por categoria</Title>
      </Header>
      {isLoading ? (
        <LoadContainer>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </LoadContainer>
      ) : (
        <>
          <Content
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 24,
              paddingBottom: useBottomTabBarHeight(),
            }}
          >
            <MonthSelect>
              <MonthSelectButton onPress={() => handleChangeDate("prev")}>
                <MonthSelectIcon name="chevron-left" />
              </MonthSelectButton>

              <Month>
                {format(selectedDate, "MMMM, yyyy", { locale: ptBR })}
              </Month>
              <MonthSelectButton onPress={() => handleChangeDate("next")}>
                <MonthSelectIcon name="chevron-right" />
              </MonthSelectButton>
            </MonthSelect>
            <ChartContainer>
              <VictoryPie
                data={totalByCategories}
                colorScale={totalByCategories.map((category) => category.color)}
                style={{
                  labels: {
                    fontSize: RFValue(18),
                    fontWeight: "bold",
                    fill: theme.colors.shape,
                  },
                }}
                labelRadius={50}
                x="percent"
                y="total"
              />
            </ChartContainer>
            {totalByCategories.map((item) => (
              <HistoryCard
                key={item.key}
                title={item.name}
                ammount={item.totalFormatted}
                color={item.color}
              />
            ))}
          </Content>
        </>
      )}
    </Container>
  );
}
