import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Keyboard, Modal, TouchableWithoutFeedback, Alert } from "react-native";
import { Button } from "../../components/Forms/Button";
import { CategorySelectButton } from "../../components/Forms/CategorySelectButton";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

import { Input } from "../../components/Forms/Input";
import { InputForm } from "../../components/Forms/InputForm";
import { TransactionTypeButton } from "../../components/Forms/TransactionTypeButton";

import { CategorySelect } from "../CategorySelect";

import {
  Container,
  Fields,
  TransactionTypes,
  Form,
  Header,
  Title,
} from "./styles";

interface FormData {
  name: string;
  ammount: string;
}

const schema = Yup.object().shape({
  name: Yup.string().required("Nome é obrigatório"),
  ammount: Yup.number()
    .typeError("Informe um valor numérico")
    .positive("O valor não pode ser negativo"),
});

export function Register() {
  const [transactionType, setTransactionType] = useState("");
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [category, setCategory] = useState({
    key: "category",
    name: "Categoria",
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  function handleTransactionTypeSelect(type: "up" | "down") {
    setTransactionType(type);
  }

  function handleCloseSelectCategory() {
    setCategoryModalOpen(false);
  }

  function handleOpenSelectCategoryModal() {
    setCategoryModalOpen(true);
  }

  function handleRegister(form: FormData) {
    if (!transactionType) {
      return Alert.alert("Selecione o tipo da transação");
    }

    if (category.key === "category") {
      return Alert.alert("Selecione a categoria");
    }

    const data = {
      name: form.name,
      ammount: form.ammount,
      transactionType,
      category: category.key,
    };
    console.log(data);
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <Container>
        <Header>
          <Title>Cadastro</Title>
        </Header>
        <Form>
          <Fields>
            <InputForm
              error={errors.name && errors.name.message}
              control={control}
              name="name"
              placeholder="Nome"
              autoCapitalize="sentences"
              autoCorrect={false}
            />
            <InputForm
              error={errors.ammount && errors.ammount.message}
              control={control}
              name="ammount"
              placeholder="Preço"
              keyboardType="numeric"
            />

            <TransactionTypes>
              <TransactionTypeButton
                type="up"
                title="Income"
                onPress={() => {
                  handleTransactionTypeSelect("up");
                }}
                isActive={transactionType === "up"}
              />
              <TransactionTypeButton
                type="down"
                title="Outcome"
                onPress={() => {
                  handleTransactionTypeSelect("down");
                }}
                isActive={transactionType === "down"}
              />
            </TransactionTypes>
            <CategorySelectButton
              title={category.name}
              onPress={handleOpenSelectCategoryModal}
            />
          </Fields>
          <Button title="Enviar" onPress={handleSubmit(handleRegister)} />
        </Form>
        <Modal visible={categoryModalOpen}>
          <CategorySelect
            category={category}
            setCategory={setCategory}
            closeSelectCategory={handleCloseSelectCategory}
          />
        </Modal>
      </Container>
    </TouchableWithoutFeedback>
  );
}
