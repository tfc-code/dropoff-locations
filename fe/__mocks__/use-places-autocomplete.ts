const mockSetValue = jest.fn();
const mockClearSuggestions = jest.fn();

export const fakeSuggestion = {
  place_id: '123',
  description: 'foo',
  structured_formatting: {
    main_text: 'foo',
    secondary_text: 'bar',
  },
};

export default () => ({
  ready: true,
  value: '',
  setValue: mockSetValue,
  clearSuggestions: mockClearSuggestions,
  suggestions: {
    status: 'OK',
    data: [fakeSuggestion],
  },
});
