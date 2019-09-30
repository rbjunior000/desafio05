/* eslint-disable react/state-in-constructor */
import React, { Component } from 'react';
import { FaGithubAlt, FaPlus, FaSpinner } from 'react-icons/fa';
import { Link } from 'react-router-dom';

import api from '../../services/api';
import Container from '../../Components/Container';

import { Form, SubmitButton, List, Input } from './styles';

export default class Main extends Component {
    state = {
        newRepo: '',
        repositories: [],
        loading: false,
        submitApi: false,
    };

    // Carregar os repositorios do localstorage
    componentDidMount() {
        const repositories = localStorage.getItem('repositories');
        if (repositories) {
            this.setState({ repositories: JSON.parse(repositories) });
        }
    }

    // Salvar os dados do localStorage
    componentDidUpdate(_, prevState) {
        const { repositories } = this.state;
        if (prevState.repositories !== repositories) {
            localStorage.setItem('repositories', JSON.stringify(repositories));
        }
    }

    handleInputChange = e => {
        this.setState({ newRepo: e.target.value });
    };

    handleSubmit = async e => {
        e.preventDefault();
        this.setState({ loading: true });
        const { newRepo, repositories } = this.state;

        try {
            const ifExists = repositories.find(r => r.name === newRepo);

            if (ifExists) {
                throw new Error('Repositório duplicado');
            } else {
                const response = await api.get(`/repos/${newRepo}`);
                const data = {
                    name: response.data.full_name,
                };

                this.setState({
                    repositories: [...repositories, data],
                    newRepo: '',
                    loading: false,
                    submitApi: false,
                });
            }
        } catch (err) {
            console.log('Repositorio ja existe');
            this.setState({
                loading: false,
                submitApi: true,
            });
        }
    };

    render() {
        const { newRepo, repositories, loading, submitApi } = this.state;
        return (
            <Container>
                <h1>
                    <FaGithubAlt />
                    Repositórios
                </h1>
                <Form onSubmit={this.handleSubmit}>
                    <Input
                        value={newRepo}
                        onChange={this.handleInputChange}
                        submitApi={submitApi}
                    />

                    <SubmitButton loading={loading}>
                        {loading ? (
                            <FaSpinner color="#fff" size={14} />
                        ) : (
                            <FaPlus color="#FFF" size={14} />
                        )}
                    </SubmitButton>
                </Form>

                <List>
                    {repositories.map(repository => (
                        <li key={repository.name}>
                            <span>{repository.name}</span>
                            <Link
                                to={`/repository/${encodeURIComponent(
                                    repository.name
                                )}`}
                            >
                                Detalhes
                            </Link>
                        </li>
                    ))}
                </List>
            </Container>
        );
    }
}
