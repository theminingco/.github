import styled from "@emotion/styled";

export const MajorButton = styled.button`
    min-height: 40px;
    padding: 0 20px;
    background-color: #36456e;
    font-weight: bold;
    margin: 8px 16px;
    border-radius: 16px;
    cursor: pointer;
    transition: transform 300ms ease-out 100ms;
    &:hover {
        transform: translateY(-2px);
    }
`;

export const MinorButton = styled.button`
    min-height: 40px;
    padding: 0 20px;
    font-weight: bold;
    margin: 8px 16px;
    cursor: pointer;
    transition: transform 300ms ease-out 100ms;
    &:hover {
        transform: translateY(-2px);
    }
`;

export const LinkButton = styled.button`
    padding: 6px;
    font-size: 12px;
    font-weight: 400;
    cursor: pointer;
    &:hover {
        text-decoration: underline;
    }
`;

export const IconButton = styled.button`
    padding: 0 6px;
    margin: 4px;
    font-size: 16px;
    font-weight: bold;
    font-family: "Material Icons";
    width: 32px;
    height: 32px;
    border-radius: 50%;
    cursor: pointer;
    background-color: #e5e5e5;
    color: #2f323a;
    text-align: center;
    &:hover {
        background-color: #b6b6b6;
    }
`;

