/* eslint-disable react/state-in-constructor */
/* eslint-disable react/static-property-placement */
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import api from '../../services/api';
import Container from '../../Components/Container';

import { Loading, Owner, IssuesList, ButtonStage, Pagination } from './styles';

export default class Repository extends Component {
    static propTypes = {
        match: PropTypes.shape({
            params: PropTypes.shape({
                repository: PropTypes.string,
            }),
        }).isRequired,
    };

    state = {
        repository: {},
        issues: [],
        loading: true,
        filters: [{ state: 'all' }, { state: 'open' }, { state: 'closed' }],
        filterIndex: 0,
        page: 1,
    };

    async componentDidMount() {
        const { filters, filterIndex, page } = this.state;
        const { match } = this.props;
        const repoName = decodeURIComponent(match.params.repository);

        const [repository, issues] = await Promise.all([
            api.get(`/repos/${repoName}`),
            api.get(`/repos/${repoName}/issues`, {
                params: {
                    state: filters[filterIndex].state,
                    per_page: 5,
                    page,
                },
            }),
        ]);
        this.setState({
            repository: repository.data,
            issues: issues.data,
            loading: false,
        });
    }

    handleSelect = async e => {
        await this.setState({ filterIndex: e.target.value, page: 1 });
        this.loadIssues();
    };

    handlePage = async () => {
        const { page } = this.state;
        await this.setState({ page: page + 1 });
        this.loadIssues();
    };

    handlePageb = async () => {
        const { page } = this.state;
        await this.setState({ page: page - 1 });
        this.loadIssues();
    };

    loadIssues = async () => {
        const { match } = this.props;
        const { filters, filterIndex, page } = this.state;

        const repoName = decodeURIComponent(match.params.repository);

        const response = await api.get(`/repos/${repoName}/issues`, {
            params: {
                state: filters[filterIndex].state,
                per_page: 5,
                page,
            },
        });
        this.setState({ issues: response.data });
    };

    render() {
        const { repository, issues, loading, page } = this.state;
        if (loading) {
            return <Loading>Carregando</Loading>;
        }
        return (
            <Container>
                <Owner>
                    <Link to="/">Voltar ao repositorios</Link>
                    <img
                        src={repository.owner.avatar_url}
                        alt={repository.owner.login}
                    />
                    <h1>{repository.name}</h1>
                    <p>{repository.description}</p>
                </Owner>
                <ButtonStage onClick={this.handleSelect}>
                    <button type="submit" value="0">
                        Todos
                    </button>
                    <button type="submit" value="1">
                        Abertas
                    </button>
                    <button type="submit" value="2">
                        Fechadas
                    </button>
                </ButtonStage>
                <IssuesList>
                    {issues.map(issue => (
                        <li key={String(issue.id)}>
                            <img
                                src={issue.user.avatar_url}
                                alt={issue.user.login}
                            />
                            <div>
                                <strong>
                                    <a href={issue.html_url}>{issue.title}</a>
                                    {issue.labels.map(label => (
                                        <span key={label.id}>{label.name}</span>
                                    ))}
                                </strong>
                                <p>{issue.user.login}</p>
                            </div>
                        </li>
                    ))}
                </IssuesList>
                <Pagination>
                    <button
                        disabled={page < 2}
                        type="submit"
                        onClick={this.handlePageb}
                    >
                        Anterior
                    </button>
                    <span>Página {page}</span>
                    <button type="submit" onClick={this.handlePage}>
                        Proxíma
                    </button>
                </Pagination>
            </Container>
        );
    }
}
