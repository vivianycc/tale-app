import styled, { useTheme } from "styled-components";

const StyledLabel = styled.label`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 22px;
  font-size: 14px;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.primary};
  background: transparent;
  border: 1px solid ${({ theme }) => theme.colors.primary};

  input {
    display: none;
  }
`;

export default function FileInputButton({ label = "選擇照片", accept = "image/*", onChange }) {
  const theme = useTheme();
  return (
    <StyledLabel theme={theme}>
      {label}
      <input type="file" accept={accept} onChange={onChange} />
    </StyledLabel>
  );
}
